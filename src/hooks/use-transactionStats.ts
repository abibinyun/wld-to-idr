import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const useTransactionStats = (userId) => {
  const [stats, setStats] = useState({
    confirmedCount: 0,
    failedCount: 0,
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (!userId) return;

    const fetchTransactionStats = async () => {
      try {
        const transactionsRef = collection(db, "transactions");

        const confirmedQuery = query(
          transactionsRef,
          where("user_id", "==", userId),
          where("transactionStatus", "==", "confirmed")
        );

        const failedQuery = query(
          transactionsRef,
          where("user_id", "==", userId),
          where("transactionStatus", "==", "failed")
        );

        const confirmedSnapshot = await getDocs(confirmedQuery);
        const confirmedCount = confirmedSnapshot.size;

        const failedSnapshot = await getDocs(failedQuery);
        const failedCount = failedSnapshot.size;

        setStats({
          confirmedCount,
          failedCount,
          loading: false,
          error: "",
        });
      } catch (error) {
        console.error("Error fetching transaction stats: ", error);
        setStats({
          confirmedCount: 0,
          failedCount: 0,
          loading: false,
          error: "Failed to fetch transaction stats",
        });
      }
    };

    fetchTransactionStats();
  }, [userId]);

  return stats;
};

export default useTransactionStats;
