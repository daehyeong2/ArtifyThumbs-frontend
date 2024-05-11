import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { faCheck, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { reRenderAtom, userAtom } from "../atom";
import Seo from "../components/Seo";
import { doc, updateDoc } from "firebase/firestore";
import {
  sendEmailVerification,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  height: 100%;
`;

const SettingBox = styled.div`
  display: flex;
  align-items: center;
  div {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    div {
      gap: 3px;
      position: relative;
    }
  }
`;

const SettingInfo = styled.span`
  position: absolute;
  bottom: -23px;
  display: flex;
  gap: 8px;
  width: 100%;
  span {
    color: #0984e3;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SettingLabel = styled.label``;

const SettingInput = styled.input`
  width: 400px;
  font-size: 16px;
  padding: 3px 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  outline: none;
  transition: border 0.1s ease-in-out;
  background-color: ${(props) => (props.$disabled ? "rgba(0,0,0,0.08)" : "")};
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &:focus {
    border: 1px solid #0984e3;
  }
`;

const AvatarContainer = styled(motion.label)`
  margin-left: auto;
  position: relative;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 1px solid rgba(0, 0, 0, 0.2);
`;
const AvatarOverlay = styled(motion.div)`
  position: absolute;
  width: 152px;
  height: 152px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  top: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

const AvatarIcon = styled(motion(FontAwesomeIcon))`
  margin-left: 10px;
  color: black;
  font-size: 50px;
`;

const avatarVariants = {
  initial: {
    opacity: 0,
  },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

const SaveButton = styled.button`
  position: absolute;
  right: 15px;
  bottom: 15px;
  background-color: #0984e3;
  border-radius: 15px;
  padding: 8px 10px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  border: none;
  transition: opacity 0.1s ease-in-out;
  &:hover {
    opacity: 0.8;
  }
`;

const AvatarInput = styled.input`
  display: none;
`;

const SaveText = styled(motion.span)`
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 5px 8px;
  border-radius: 8px;
  width: max-content;
  font-size: 14px;
  color: white;
  border: 2px solid #0a5f3288;
  background-color: #1ec25a;
  display: flex;
  gap: 5px;
`;

const saveTextVariants = {
  initial: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const ProfileSettings = () => {
  const user = auth.currentUser;
  const userData = useRecoilValue(userAtom);
  const setReRender = useSetRecoilState(reRenderAtom);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState("");
  const [avatarIsLoading, setAvatarIsLoading] = useState(false);
  const [saveIsHidden, setSaveIsHidden] = useState(true);
  const [isSended, setIsSended] = useState(false);
  const [lastEmail, setLastEmail] = useState("");
  const [lastUsername, setLastUsername] = useState("");
  useEffect(() => {
    if (!user || !userData) return;
    setEmail(user.email);
    setUsername(user.displayName);
    setLastEmail(user.email);
    setUsername(user.displayName);
    setAvatar(user.photoURL);
  }, [user, userData]);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isSaved) {
        // 기본 이벤트를 방지하고 사용자에게 경고 메시지를 표시합니다.
        event.preventDefault();
        event.returnValue =
          "변경사항이 저장되지 않았습니다. 페이지를 떠나시겠습니까?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaved]);
  const onChange = (e) => {
    switch (e.target.id) {
      case "email":
        setEmail(e.target.value);
        if (user.email !== e.target.value) setIsSaved(false);
        else setIsSaved(true);
        break;
      case "username":
        setUsername(e.target.value);
        if (user.displayName !== e.target.value) setIsSaved(false);
        else setIsSaved(true);
        break;
      default:
        break;
    }
  };
  const onSave = async () => {
    if (isSaved || isLoading || !email || !username) return;
    try {
      setLoading(true);
      if (lastEmail !== email) {
        await updateEmail(user, email);
        setLastEmail(email);
      }
      if (lastUsername !== username) {
        await updateProfile(user, { displayName: username });
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username });
        setLastUsername(username);
      }
      setIsSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const onUpload = async (e) => {
    const { files } = e.target;
    if (!user || avatarIsLoading) return;
    if (files && files.length === 1) {
      try {
        setAvatarIsLoading(true);
        const file = files[0];
        const locationRef = ref(storage, `avatars/${user.uid}`);
        const result = await uploadBytes(locationRef, file);
        const avatarUrl = await getDownloadURL(result.ref);
        await updateProfile(user, { photoURL: avatarUrl });
        setAvatar(avatarUrl);
        setAvatarFile("");
        setSaveIsHidden(false);
        setReRender((prev) => !prev);
        setTimeout(() => {
          setSaveIsHidden(true);
        }, 3000);
      } catch (e) {
        console.error(e);
      } finally {
        setAvatarIsLoading(false);
      }
    }
  };
  const onSend = async () => {
    try {
      await sendEmailVerification(user);
      alert("이메일을 전송했습니다. (인증 후 새로고침 해주세요.)");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSended(true);
    }
  };
  console.log(isSaved);
  return (
    <Wrapper>
      <Seo
        title="프로필 설정"
        description="당신의 공개 프로필 정보를 수정하세요."
      />
      <SettingBox>
        <div>
          <div>
            <SettingLabel htmlFor="username">이름</SettingLabel>
            <SettingInput
              value={username}
              type="text"
              id="username"
              autoComplete="off"
              placeholder="이름을 입력해 주세요."
              onChange={onChange}
              disabled={isLoading}
              $disabled={isLoading}
            />
          </div>
          <div>
            <SettingLabel htmlFor="email">이메일</SettingLabel>
            <SettingInput
              value={email}
              type="email"
              id="email"
              autoComplete="off"
              placeholder="이메일을 입력해 주세요."
              onChange={onChange}
              disabled={isLoading || !user?.emailVerified}
              $disabled={isLoading || !user?.emailVerified}
            />
            {!user?.emailVerified && (
              <SettingInfo>
                이메일 인증이 필요합니다.{" "}
                <span onClick={onSend}>
                  {isSended
                    ? "인증 링크가 전송되지 않았나요?"
                    : "이메일 인증 링크 보내기"}
                </span>
              </SettingInfo>
            )}
          </div>
        </div>
        <AvatarContainer
          htmlFor="avatarInput"
          initial="initial"
          whileHover="hover"
        >
          <Avatar src={avatar} />
          <AnimatePresence>
            {!saveIsHidden && (
              <SaveText
                variants={saveTextVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.2 }}
                exit="exit"
              >
                <FontAwesomeIcon icon={faCheck} />
                저장됨
              </SaveText>
            )}
          </AnimatePresence>
          <AvatarOverlay
            transition={{ duration: 0.2 }}
            variants={avatarVariants}
          >
            <AvatarIcon icon={faUserEdit} />
          </AvatarOverlay>
        </AvatarContainer>
        <AvatarInput
          disabled={avatarIsLoading}
          value={avatarFile}
          onChange={onUpload}
          id="avatarInput"
          type="file"
          accept="image/*"
        />
      </SettingBox>
      <SaveButton onClick={onSave}>
        {isLoading ? "저장하는 중.." : "저장하기"}
      </SaveButton>
    </Wrapper>
  );
};

export default ProfileSettings;