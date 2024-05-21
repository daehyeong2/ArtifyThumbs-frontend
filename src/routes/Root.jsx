import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import MainFooter from "../components/Footer";
import pageScrollTop from "../components/pageScrollTop";
import TopButton from "../components/TopButton";
import styled from "styled-components";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import LoadingScreen from "../components/LoadingScreen";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isBlockedAtom, userAtom, userIsLoadedAtom, widthAtom } from "../atom";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import EmailVerification from "../components/EmailVerification";
import usePrompt from "../components/usePrompt";

const Wrapper = styled.div`
  min-height: 100vh;
`;

const Root = () => {
  pageScrollTop();
  const user = auth.currentUser;
  const [isLoading, setLoading] = useState(false);
  const isBlocked = useRecoilValue(isBlockedAtom);
  const setUser = useSetRecoilState(userAtom);
  const setUserIsLoaded = useSetRecoilState(userIsLoadedAtom);
  const setWidth = useSetRecoilState(widthAtom);
  const init = useCallback(async () => {
    setLoading(true);
    await auth.authStateReady();
    if (auth.currentUser) {
      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", auth.currentUser.uid),
        limit(1)
      );
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        const user = userSnap.docs[0].data();
        setUser(user);
      }
    }
    setLoading(false);
    setUserIsLoaded(true);
  }, [setUser, setUserIsLoaded]);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setWidth]);
  useEffect(() => {
    init();
  }, [init]);
  usePrompt("정말로 떠나시겠습니까?", isBlocked);
  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : !user || user.emailVerified ? (
        <>
          <NavBar />
          <Wrapper>
            <Outlet />
          </Wrapper>
          <MainFooter />
          <TopButton />
        </>
      ) : (
        <EmailVerification />
      )}
    </>
  );
};

export default Root;
