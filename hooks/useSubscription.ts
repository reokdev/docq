"use client";

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

// number of docs the user is allowed to have
const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

function useSubscription() {
  const [hasActiveMembership, setHasActiveMembership] = useState(null);
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();

  //   Listen to the User document
  const [snapshot, loading, error] = useDocument(
    user && doc(db, "users", user.id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  //   Listen to the users files collection
  const [filesSnapshot, filesLoading] = useCollection(
    user && collection(db, "users", user?.id, "files")
  );

  useEffect(() => {
    if (!user) {
      console.log("No user available");
      return;
    }

    if (!snapshot) {
      console.log("No snapshot available yet for user:", user.id);
      return;
    }

    const data = snapshot.data();
    if (!data) {
      console.log("No data in snapshot for user:", user.id);
      // Initialize the user document if it doesn't exist using client SDK
      setDoc(doc(db, "users", user.id), {
        hasActiveMembership: false,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName,
      }, { merge: true }).catch(console.error);
      return;
    }

    console.log("Subscription data:", {
      hasActiveMembership: data.hasActiveMembership,
      userId: user.id,
      stripeCustomerId: data.stripeCustomerId,
      timestamp: new Date().toISOString()
    });

    setHasActiveMembership(data.hasActiveMembership);
  }, [snapshot, user]);

  useEffect(() => {
    if (!filesSnapshot || hasActiveMembership === null) return;

    const files = filesSnapshot.docs;
    const usersLimit = hasActiveMembership ? PRO_LIMIT : FREE_LIMIT;

    console.log(
      "Checking if user is over file limit",
      files.length,
      usersLimit
    );

    setIsOverFileLimit(files.length >= usersLimit);
  }, [filesSnapshot, hasActiveMembership]);

  return { hasActiveMembership, loading, error, isOverFileLimit, filesLoading };
}

export default useSubscription;