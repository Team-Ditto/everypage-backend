import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';

import { FirebaseService } from 'src/firebase/firebase.service';
import { BookDocument } from 'src/books/entities/book.entity';
import { UserDocument } from 'src/users/entities/user.entity';
import { TriggerType } from 'src/shared/shared.service';

export enum NotificationStatus {
    Read = 'read',
    Unread = 'unread',
}

export interface NotificationObject {
    title: string;
    description: string;
    created: Date;
    owner: string;
    book: any;
    initiator?: string;
    status: NotificationStatus;
}

@Injectable()
export class NotificationsService {
    db: FirebaseFirestore.Firestore;

    constructor(private firebaseService: FirebaseService) {
        this.db = getFirestore(this.firebaseService.firebaseApp);
    }

    async createNotification(
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
                    book: book.toObject(),
                    created: new Date(),
                };

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
