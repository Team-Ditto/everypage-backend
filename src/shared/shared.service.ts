import { UpdateWishlistDto } from './../wishlists/dto/update-wishlist.dto';
import { Request } from 'express';
import { Injectable, Req, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';
import { BooksService } from 'src/books/books.service';
import { WishlistsService } from 'src/wishlists/wishlists.service';

import { User, UserDocument } from 'src/users/entities/user.entity';
import { WishlistDocument, WishlistStatus } from 'src/wishlists/entities/wishlist.entity';
import { BookDocument, BookBorrowingStatus } from 'src/books/entities/book.entity';

import { CreateWishlistDto } from 'src/wishlists/dto';
import { HandleTriggerRequestDto } from './dto/handle-trigger-request.dto';
import { UpdateBookDto } from 'src/books/dto';

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
    bookOwner: any;
    initiator: any;
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

                    const wishlist: WishlistDocument = await this.wishlistsService.updateWishlistByBookId(
                        req.user._id,
                        data.book,
                        {
                            status: WishlistStatus.ForLater,
                        } as UpdateWishlistDto,
                    );

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

                    await this.createChats(data.triggerType, updatedBook, relatedBook.requestor, req.user);

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

                    await this.createChats(data.triggerType, updatedBook, updatedBook.owner, req.user);

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
        try {
            let newNotification: NotificationObject;

            switch (triggerType) {
                case TriggerType.RequestToBorrow:
                    newNotification = {
                        title: 'Book Requested',
                        description: `${initiator.displayName} requested to borrow ${book.title}. Tap to confirm request.`,
                        chatRedirect: false,
                    } as NotificationObject;

                    break;

                case TriggerType.CancelHold:
                    newNotification = {
                        title: 'Book Request Cancelled',
                        description: `${initiator.displayName} cancelled the requested to borrow ${book.title}.`,
                        chatRedirect: false,
                    } as NotificationObject;

                    break;

                case TriggerType.BorrowRequestAccept:
                    newNotification = {
                        title: 'Borrowing Book Confirmation',
                        description: `${initiator.displayName} accepted to lent ${book.title} to you. Tap to chat.`,
                        chatRedirect: true,
                    } as NotificationObject;

                    break;

                case TriggerType.BorrowRequestDecline:
                    newNotification = {
                        title: 'Borrowing Book Declined',
                        description: `${initiator.displayName} declined to lent ${book.title} to you.`,

                        chatRedirect: false,
                    } as NotificationObject;

                    break;

                case TriggerType.UserReturns:
                    newNotification = {
                        title: 'Book Return Request',
                        description: `${initiator.displayName} wants to return ${book.title}. Tap to chat.`,
                        chatRedirect: true,
                    } as NotificationObject;

                    break;

                default:
                    break;
            }

            await this.getNotificationRef().set({
                ...newNotification,
                status: NotificationStatus.Unread,
                owner: owner._id,
                initiator: initiator._id,
                book: book._id.toString(),
                bookOwner: book.owner._id.toString(),
                created: new Date(),
            });
        } catch (error) {
            console.log(error);
        }
    }

    private async createChats(triggerType: TriggerType, book: BookDocument, owner: User, initiator: UserDocument) {
        try {
            let banner: string;
            const combinedId = this.getCombinedUserId(owner._id, initiator._id);
            const bookRef = {
                _id: book._id.toString(),
                title: book.title,
                author: book.author,
                images: book.images,
                owner: book.owner._id.toString(),
                borrowingStatus: book.borrowingStatus,
            };

            switch (triggerType) {
                case TriggerType.BorrowRequestAccept:
                    banner = `${owner.displayName} placed book borrowing request.`;
                    break;

                case TriggerType.UserReturns:
                    banner = `${initiator.displayName} placed book return request.`;
                    break;

                default:
                    break;
            }

            const res: FirebaseFirestore.DocumentSnapshot = await this.getChatsRef(combinedId).get();

            if (!res.exists) {
                // create a chat in chats collection
                await this.getChatsRef(combinedId).set({
                    messages: [],
                    banner,
                    book: bookRef,
                });

                // create user chats for both related users
                await this.getUserChatsRef(owner._id).update({
                    chatRefs: firestore.FieldValue.arrayUnion({
                        _id: combinedId,
                        userInfo: {
                            _id: initiator._id,
                            displayName: initiator.displayName,
                            photoURL: initiator.photoURL,
                        },
                        date: Timestamp.now(),
                    }),
                });

                await this.getUserChatsRef(initiator._id).update({
                    chatRefs: firestore.FieldValue.arrayUnion({
                        _id: combinedId,
                        userInfo: {
                            _id: owner._id,
                            displayName: owner.displayName,
                            photoURL: owner.photoURL,
                        },
                        date: Timestamp.now(),
                    }),
                });
            } else {
                // update the chat in chats collection
                await this.getChatsRef(combinedId).set(
                    {
                        banner,
                        book: bookRef,
                    },
                    {
                        merge: true,
                    },
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    private getNotificationRef(): FirebaseFirestore.DocumentReference {
        return this.db.collection('notifications').doc();
    }

    private getUserChatsRef(docId: string): FirebaseFirestore.DocumentReference {
        return this.db.collection('userChats').doc(docId);
    }

    private getChatsRef(docId: string): FirebaseFirestore.DocumentReference {
        return this.db.collection('chats').doc(docId);
    }

    private getCombinedUserId(user1: string, user2: string): string {
        return user1 > user2 ? user1 + user2 : user2 + user1;
    }
}
