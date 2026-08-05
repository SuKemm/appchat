import {
    collection,
    doc,
    orderBy,
    query,
} from "firebase/firestore";

import { db } from "../../firebase";

import {
    COLLECTIONS,
} from "../../constants";

// =========================
// COLLECTION
// =========================

export function getUsersCollection() {

    return collection(
        db,
        COLLECTIONS.USERS,
    );

}

// =========================
// DOCUMENT
// =========================

export function getUserDocument(uid) {

    return doc(
        db,
        COLLECTIONS.USERS,
        uid,
    );

}

// =========================
// QUERY
// =========================

export function getUsersQuery() {

    return query(

        getUsersCollection(),

        orderBy("displayName"),

    );

}