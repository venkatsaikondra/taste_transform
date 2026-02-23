"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import styles from "./profile.module.css";

interface UserData {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

const Page = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/users/me");
      if (response.data.user) {
        setUserData(response.data.user);
      } else {
        router.push("/login");
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error("Failed to load profile");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <User size={48} />
          </div>
          <h1 className={styles.title}>Profile</h1>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoItem}>
            <div className={styles.iconWrapper}>
              <User size={20} />
            </div>
            <div className={styles.infoContent}>
              <label className={styles.label}>Username</label>
              <p className={styles.value}>{userData?.username}</p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.iconWrapper}>
              <Mail size={20} />
            </div>
            <div className={styles.infoContent}>
              <label className={styles.label}>Email</label>
              <p className={styles.value}>{userData?.email}</p>
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.iconWrapper}>
              <Calendar size={20} />
            </div>
            <div className={styles.infoContent}>
              <label className={styles.label}>Member Since</label>
              <p className={styles.value}>
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <button onClick={logOut} className={styles.logoutButton}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Page;