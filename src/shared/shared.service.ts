import { UpdateWishlistDto } from './../wishlists/dto/update-wishlist.dto';
import { Request } from 'express';
import { Injectable, Req, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';

import { UsersService } from 'src/users/users.service';
import { BooksService } from 'src/books/books.service';
import { WishlistsService } from 'src/wishlists/wishlists.service';

import { UserDocument } from 'src/users/entities/user.entity';
import { WishlistDocument, WishlistStatus } from 'src/wishlists/entities/wishlist.entity';
import { BookDocument, BookBorrowingStatus } from 'src/books/entities/book.entity';

import { CreateWishlistDto } from 'src/wishlists/dto';
import { HandleTriggerRequestDto } from './dto/handle-trigger-request.dto';
import { UpdateBookDto } from 'src/books/dto';
import { FirebaseService } from 'src/firebase/firebase.service';

export enum TriggerType {
    RequestToBorrow = 'request_to_borrow',
    CancelHold = 'cancel_hold',
    BorrowRequestAccept = 'borrow_request_accept',
    BorrowRequestDecline = 'borrow_request_decline',
    UserReturns = 'user_returns',
}

export enum NotificationStatus {
    Read = 'read',
    Unread = 'unread',
}

export interface NotificationObject {
    title: string;
    description: string;
    created: Date;
    owner: any;
    book: any;
    initiator?: any;
    status: NotificationStatus;
    chatRedirect: boolean;
}

@Injectable()
export class SharedService {
    private readonly logger = new Logger(SharedService.name);
    private db: FirebaseFirestore.Firestore;

    constructor(
        private usersService: UsersService,
        private booksService: BooksService,
        private wishlistsService: WishlistsService,
        private firebaseService: FirebaseService,
    ) {
        this.db = getFirestore(this.firebaseService.firebaseApp);
    }

    async handleTriggerRequest(@Req() req: Request, data: HandleTriggerRequestDto): Promise<void | WishlistDocument> {
        try {
            switch (data.triggerType) {
                case TriggerType.RequestToBorrow: {
                    this.logger.log(`********** Triggering ${data.triggerType} **********`);

                    if (!data.wishlist) {
                        this.logger.log('Creating new wishlist first');

                        const createWishlistDto = {
                            book: data.book,
                            status: WishlistStatus.Requested,
                        } as CreateWishlistDto;

                        const createdWishlist = await this.wishlistsService.createNewWishlist(req, createWishlistDto);

                        data.wishlist = createdWishlist._id;
                    }

                    this.logger.log('Updating wishlist by id');

                    const wishlist: WishlistDocument = await this.wishlistsService.updateWishlistById(data.wishlist, {
                        status: WishlistStatus.Requested,
                    } as UpdateWishlistDto);

                    const updatedBook = await this.booksService.updateBookById((wishlist.book as BookDocument)._id, {
                        borrowingStatus: BookBorrowingStatus.Hold,
                        requestor: req.user.id,
                        bearer: null,
                        bookReturnRequest: false,
                    } as UpdateBookDto);

                    await this.createNotification(
                        data.triggerType,
                        updatedBook.owner as UserDocument,
                        req.user,
                        updatedBook,
                    );

                    return wishlist;
                }

                case TriggerType.CancelHold: {
                    this.logger.log(`********** Triggering ${data.triggerType} **********`);

                    this.logger.log('Updating wishlist by id');

                    const wishlist: WishlistDocument = await this.wishlistsService.updateWishlistById(data.wishlist, {
                        status: WishlistStatus.ForLater,
                    } as UpdateWishlistDto);

                    const updatedBook = await this.booksService.updateBookById((wishlist.book as BookDocument)._id, {
                        borrowingStatus: BookBorrowingStatus.Available,
                        requestor: null,
                        bearer: null,
                        bookReturnRequest: false,
                    } as UpdateBookDto);

                    await this.createNotification(
                        data.triggerType,
                        updatedBook.owner as UserDocument,
                        req.user,
                        updatedBook,
                    );

                    return wishlist;
                }

                case TriggerType.BorrowRequestAccept: {
                    this.logger.log(`********** Triggering ${data.triggerType} **********`);

                    const relatedBook = await this.booksService.getBookById(data.book);

                    const updatedBook = await this.booksService.updateBookById(data.book, {
                        requestor: null,
                        bearer: relatedBook.requestor._id,
                        bookReturnRequest: false,
                    } as UpdateBookDto);

                    // now that the request is accepted, delete the wishlist
                    this.logger.log('Deleting wishlist by bookId');

                    await this.wishlistsService.deleteWishlistByBookId(relatedBook.requestor._id, data.book);

                    await this.createNotification(
                        data.triggerType,
                        relatedBook.requestor as UserDocument,
                        req.user,
                        updatedBook,
                    );

                    return;
                }

                case TriggerType.BorrowRequestDecline: {
                    this.logger.log(`********** Triggering ${data.triggerType} **********`);

                    const relatedBook = await this.booksService.getBookById(data.book);

                    const updatedBook = await this.booksService.updateBookById(data.book, {
                        borrowingStatus: BookBorrowingStatus.Available,
                        requestor: null,
                        bearer: null,
                        bookReturnRequest: false,
                    } as UpdateBookDto);

                    // now that the request is accepted, delete the wishlist
                    this.logger.log('Updating wishlist by bookId');

                    await this.wishlistsService.updateWishlistByBookId(relatedBook.requestor._id, data.book, {
                        status: WishlistStatus.ForLater,
                    } as UpdateWishlistDto);

                    await this.createNotification(
                        data.triggerType,
                        relatedBook.requestor as UserDocument,
                        req.user,
                        updatedBook,
                    );

                    return;
                }

                case TriggerType.UserReturns: {
                    this.logger.log(`********** Triggering ${data.triggerType} **********`);

                    const updatedBook = await this.booksService.updateBookById(data.book, {
                        bookReturnRequest: true,
                    } as UpdateBookDto);

                    await this.createNotification(
                        data.triggerType,
                        updatedBook.owner as UserDocument,
                        req.user,
                        updatedBook,
                    );

                    return;
                }

                default:
                    throw new Error('Incorrect triggerType value');
            }
        } catch (error) {
            this.logger.error(error);

            if (error.message === 'Incorrect triggerType value') {
                throw new HttpException('Incorrect triggerType value', HttpStatus.BAD_REQUEST);
            }

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async createNotification(
        triggerType: TriggerType,
        owner: UserDocument,
        initiator: UserDocument,
        book: BookDocument,
    ) {
        let newNotification: NotificationObject;

        switch (triggerType) {
            case TriggerType.RequestToBorrow:
                newNotification = {
                    title: 'Book Requested',
                    description: `${initiator.displayName} requested to borrow ${book.title}. Tap to confirm request.`,
                    status: NotificationStatus.Unread,
                    owner: owner._id,
                    initiator: initiator._id,
                    book: book._id.toString(),
                    created: new Date(),
                    chatRedirect: false,
                };

                break;

            case TriggerType.CancelHold:
                newNotification = {
                    title: 'Book Request Cancelled',
                    description: `${initiator.displayName} cancelled the requested to borrow ${book.title}.`,
                    status: NotificationStatus.Unread,
                    owner: owner._id,
                    initiator: initiator._id,
                    book: book._id.toString(),
                    created: new Date(),
                    chatRedirect: false,
                };

                break;

            case TriggerType.BorrowRequestAccept:
                newNotification = {
                    title: 'Borrowing Book Confirmation',
                    description: `${initiator.displayName} accepted to lent ${book.title} to you. Tap to chat.`,
                    status: NotificationStatus.Unread,
                    owner: owner._id,
                    initiator: initiator._id,
                    book: book._id.toString(),
                    created: new Date(),
                    chatRedirect: true,
                };

                break;

            case TriggerType.BorrowRequestDecline:
                newNotification = {
                    title: 'Borrowing Book Declined',
                    description: `${initiator.displayName} declined to lent ${book.title} to you.`,
                    status: NotificationStatus.Unread,
                    owner: owner._id,
                    initiator: initiator._id,
                    book: book._id.toString(),
                    created: new Date(),
                    chatRedirect: false,
                };

                break;

            case TriggerType.UserReturns:
                newNotification = {
                    title: 'Book Return Request',
                    description: `${initiator.displayName} wants to return ${book.title}. Tap to chat.`,
                    status: NotificationStatus.Unread,
                    owner: owner._id,
                    initiator: initiator._id,
                    book: book._id.toString(),
                    created: new Date(),
                    chatRedirect: true,
                };

                break;

            default:
                break;
        }

        console.log(newNotification);

        await this.getNotificationRef().set(newNotification);
    }

    private getNotificationRef(): FirebaseFirestore.DocumentReference {
        return this.db.collection('notifications').doc();
    }
}
