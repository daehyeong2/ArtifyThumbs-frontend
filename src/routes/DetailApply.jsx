import Seo from "../components/Seo";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  faDownload,
  faPlus,
  faTrashCan,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import {
  Back,
  BigImage,
  Chat,
  Detail,
  DetailData,
  DetailDesc,
  DetailDescription,
  DetailImage,
  DetailInfo,
  DetailInfoes,
  DetailMetaData,
  DetailResult,
  DetailTitle,
  DetailType,
  Download,
  DownloadContainer,
  Draft,
  DraftDesc,
  DraftList,
  DraftTitle,
  Drafts,
  ImageDownload,
  ImageDownloadIcon,
  ImageViewer,
  MessageButton,
  MessageForm,
  MessageInput,
  MessageList,
  Notification,
  Overlay,
  Tooltip,
  TooltipContainer,
  Wrapper,
  messageButtonVariants,
  parseISOString,
  tooltipVariants,
  UploadIcon,
  DraftUploadButton,
  DeleteImage,
  ImageButtons,
  Title,
  ApplyManage,
  DeleteApply,
  MessageUpload,
  MessageUploadIcon,
  MessageFile,
  MessageImage,
  MessageImageContainer,
  MessageImageTitle,
  cutString,
  messageImageVariants,
  MessageDate,
  MessageContent,
  MessageContainer,
  DeleteMessage,
} from "../components/detailApply";
import styled from "styled-components";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import ChatLazyImage from "../components/ChatLazyImage";
import DraftLazyImage from "../components/DraftLazyImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";

const Message = styled.li`
  display: flex;
  justify-content: ${(props) => (!props.$isMe ? "flex-start" : "flex-end")};
`;

const FileInput = styled.input`
  display: none;
`;

let socket = null;

const DetailApply = () => {
  const ulRef = useRef(null);
  const { register, handleSubmit, setValue, setFocus } = useForm();
  const { applyId } = useParams();
  const [apply, setApply] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();
  const fetchOrder = useCallback(async () => {
    if (!user) return;
    const docRef = doc(db, "orders", applyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.orderer === user.uid) {
        const userQuery = query(
          collection(db, "users"),
          where("userId", "==", data.orderer),
          limit(1)
        );
        const userSnap = await getDocs(userQuery);
        if (userSnap.docs.length !== 0) {
          setApply({ ...data, orderer: userSnap.docs[0].data() });
        } else {
          alert("신청인 정보가 없습니다.");
          navigate("/");
        }
      } else {
        alert("권한 없음");
        navigate("/");
      }
    } else {
      alert("없는 주문입니다.");
      navigate("/");
    }
  }, [applyId, navigate, user]);
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);
  const [chats, setChats] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [newDrafts, setNewDrafts] = useState([]);
  const [openDraft, setOpenDraft] = useState(false);
  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const [draftPath, setDraftPath] = useState(null);
  const [applyDeleteIsLoading, setApplyDeleteLoading] = useState(false);
  const [chatFile, setChatFile] = useState(null);
  const [file, setFile] = useState("");
  const [draftFile, setDraftFile] = useState("");
  const [openChat, setOpenChat] = useState(null);

  const onSubmit = (data) => {
    if (!data.message) return;
    setValue("message", "");
    setFocus("message");
    if (!user) {
      alert("권한 없음");
      return navigate("/");
    }
    const now = new Date().toISOString();
    socket.emit(
      "chat_message",
      {
        message: data.message,
        isMe: true,
        imageUrl: chatFile?.imageUrl ?? "",
        timestamp: now,
      },
      applyId
    );
    paint_message(data.message, true, chatFile?.imageUrl ?? "", now);
  };

  const paint_message = useCallback(
    (message, isMe, imageUrl, timestamp) => {
      setChats((prev) => [...prev, { message, isMe, imageUrl, timestamp }]);
      const ulElement = ulRef.current;
      setFile("");
      setChatFile(null);
      setTimeout(() => {
        if (
          isMe ||
          ulElement.scrollHeight -
            (ulElement.scrollTop + ulElement.clientHeight) <
            200
        ) {
          scrollDown();
        }
      }, 10);
    },
    [ulRef]
  );
  useEffect(() => {
    if (apply) {
      user.getIdToken().then((token) => {
        socket = io.connect(process.env.REACT_APP_BACKEND_URL, {
          query: { token },
        });
        socket.emit("chat_room", applyId);
        socket.on("chat_message", (data) => {
          paint_message(data.message, data.isMe, data.imageUrl, data.timestamp);
        });
        socket.on("error", (error) => {
          alert(`에러 발생: ${error}`);
        });
        socket.on("chats", (data) => {
          setChats(data);
          setTimeout(() => {
            scrollDown();
          }, 10);
        });
        socket.on("delete_message", async (chat) => {
          setChats((prevChats) => {
            if (prevChats.some((item) => _.isEqual(item, chat))) {
              return prevChats.filter((item) => !_.isEqual(item, chat));
            } else {
              setApply((prevApply) => ({
                ...prevApply,
                chats: prevApply.chats.filter((item) => !_.isEqual(item, chat)),
              }));
              return prevChats;
            }
          });
        });
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [apply, applyId, paint_message, user]);

  function scrollDown() {
    if (ulRef.current) {
      const ulElement = ulRef.current;
      ulElement.scrollTop = ulElement.scrollHeight + 59;
    }
  }
  useEffect(() => {
    if (apply) {
      scrollDown();
    }
  }, [apply]);
  const onDownload = async () => {
    try {
      const response = await fetch(
        openDraft || openChat ? currentImage : apply.result
      );
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      if (openChat) {
        link.download = `${openChat} (ArtifyThumbs 채팅사진).jpg`;
      } else if (openDraft) {
        link.download = `${openDraft} (ArtifyThumbs 참고사진).jpg`;
      } else {
        link.download = `${apply.title} (ArtifyThumbs 완성본).jpg`;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  const onChangeFile = async (e) => {
    const { files } = e.target;
    if (
      isLoading ||
      !user ||
      apply.drafts.length + newDrafts.length >= (apply.plan === "pro" ? 12 : 6)
    )
      return;
    if (files && files.length === 1) {
      try {
        setLoading(true);
        const file = files[0];
        const title = prompt("참고 사진의 설명을 입력해 주세요.");
        if (!title) return;
        const locationRef = ref(storage, `drafts/${applyId}/${Date.now()}`);
        const result = await uploadBytes(locationRef, file);
        const resultUrl = await getDownloadURL(result.ref);
        const docRef = doc(db, "orders", applyId);
        const newDraft = {
          imageUrl: resultUrl,
          title,
          path: locationRef.fullPath,
        };
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          let drafts = docSnap.data().drafts;
          drafts.unshift(newDraft);
          await updateDoc(docRef, {
            drafts,
          });
          setNewDrafts((prev) => [newDraft, ...prev]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setDraftFile("");
      }
    }
  };
  const onDelete = async () => {
    if (deleteIsLoading || !user || !draftPath) return;
    try {
      setDeleteIsLoading(true);
      const locationRef = ref(storage, draftPath);
      await deleteObject(locationRef);
      const docRef = doc(db, `orders/${applyId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const doc = docSnap.data();
        const drafts = doc.drafts;

        const updatedDrafts = drafts.filter(
          (draft) => draft.path !== draftPath
        );

        await updateDoc(docRef, { drafts: updatedDrafts });
        if (apply.drafts.length > 0) {
          const updatedApplyDrafts = apply.drafts.filter(
            (draft) => draft.path !== draftPath
          );
          setApply((prev) => ({ ...prev, drafts: updatedApplyDrafts }));
        }
        if (newDrafts.length > 0) {
          const updatedNewDrafts = newDrafts.filter(
            (draft) => draft.path !== draftPath
          );
          setNewDrafts(updatedNewDrafts);
        }
        setCurrentImage(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteIsLoading(false);
    }
  };
  const onCancel = async () => {
    if (applyDeleteIsLoading || !user || !apply.isCompleted) return;
    try {
      const ok = window.confirm(
        "신청을 삭제하시겠습니까? (삭제하시면 복구하실 수 없습니다.)"
      );
      if (ok) {
        setApplyDeleteLoading(true);
        const draftsRef = ref(storage, `drafts/${applyId}/`);
        const drafts = await listAll(draftsRef);
        drafts.items.forEach(async (itemRef) => {
          await deleteObject(itemRef);
        });
        const chatsRef = ref(storage, `chats/${applyId}/`);
        const chats = await listAll(chatsRef);
        chats.items.forEach(async (itemRef) => {
          await deleteObject(itemRef);
        });
        const resultRef = ref(storage, `results/${applyId}`);
        await deleteObject(resultRef);
        const docRef = doc(db, `orders/${applyId}`);
        await deleteDoc(docRef);
        navigate("/apply-list");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplyDeleteLoading(false);
    }
  };
  const onUpload = async (e) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const file = files[0];
      try {
        const locationRef = ref(storage, `chats/${applyId}/${Date.now()}`);
        const result = await uploadBytes(locationRef, file);
        const resultUrl = await getDownloadURL(result.ref);
        setChatFile({
          ref: locationRef,
          imageUrl: resultUrl,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };
  const onDeleteImage = useCallback(async () => {
    if (chatFile) {
      await deleteObject(chatFile.ref);
      setFile("");
      return setChatFile(null);
    }
  }, [chatFile]);
  useEffect(() => {
    const deleteFunction = () => {
      onDeleteImage();
    };
    if (chatFile) {
      window.addEventListener("beforeunload", deleteFunction);
    }
    return () => {
      window.removeEventListener("beforeunload", deleteFunction);
    };
  }, [onDeleteImage, chatFile]);
  const onDeleteMessage = async (chat) => {
    if (!window.confirm("이 메시지를 정말로 삭제하시겠습니까?")) return;
    socket.emit("delete_message", chat);
    if (chats.includes(chat)) {
      setChats((prev) => prev.filter((item) => item !== chat));
      if (typeof chat.imageUrl === "string" && chat.imageUrl !== "") {
        try {
          const baseUrl =
            "https://firebasestorage.googleapis.com/v0/b/artifythumbs-37528.appspot.com/o/";
          const path = chat.imageUrl.replace(baseUrl, "").split("?")[0];
          const decodedPath = decodeURIComponent(path);
          const imageRef = ref(storage, decodedPath);
          await deleteObject(imageRef);
        } catch (e) {
          console.error(e);
        }
      }
    } else if (apply.chats.includes(chat)) {
      setApply((prev) => ({
        ...prev,
        chats: prev.chats.filter((item) => item !== chat),
      }));
      if (typeof chat.imageUrl === "string" && chat.imageUrl !== "") {
        try {
          const baseUrl =
            "https://firebasestorage.googleapis.com/v0/b/artifythumbs-37528.appspot.com/o/";
          const path = chat.imageUrl.replace(baseUrl, "").split("?")[0];
          const decodedPath = decodeURIComponent(path);
          const imageRef = ref(storage, decodedPath);
          await deleteObject(imageRef);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };
  return (
    <>
      <Seo title={apply?.title ? apply.title : "로딩 중.."} />
      <AnimatePresence>
        {currentImage && (
          <>
            <Overlay
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpenDraft(false);
                setOpenChat(false);
                setCurrentImage(null);
              }}
            />
            <ImageViewer layoutId={currentImage}>
              <BigImage src={currentImage} alt="bigImage" />
              <Title>
                {openDraft
                  ? `설명: ${cutString(openDraft, 20)}`
                  : openChat
                  ? `채팅: ${cutString(openChat, 20)}`
                  : `제목: ${cutString(apply.title, 20)}`}
              </Title>
              <ImageButtons>
                {openDraft && (
                  <DeleteImage onClick={onDelete}>
                    <ImageDownloadIcon icon={faXmark} />
                    <span>
                      {deleteIsLoading ? "삭제하는 중.." : "삭제하기"}
                    </span>
                  </DeleteImage>
                )}
                <ImageDownload onClick={onDownload}>
                  <ImageDownloadIcon icon={faDownload} />
                  <span>다운로드</span>
                </ImageDownload>
              </ImageButtons>
            </ImageViewer>
          </>
        )}
      </AnimatePresence>
      <Wrapper>
        {apply ? (
          <>
            <Back to="/apply-list">&larr; 뒤로가기</Back>
            <Detail>
              <DetailResult>
                <DetailImage
                  $isCompleted={apply.isCompleted}
                  onClick={
                    apply.isCompleted
                      ? () => setCurrentImage(apply.result)
                      : null
                  }
                  layoutId={apply.result}
                  src={apply.result}
                  alt="ApplyImage"
                ></DetailImage>
                {apply.isCompleted && (
                  <DownloadContainer onClick={onDownload}>
                    <TooltipContainer initial="initial" whileHover="hover">
                      <Download icon={faDownload} />
                      <Tooltip
                        transition={{ duration: 0.2 }}
                        variants={tooltipVariants}
                      >
                        다운로드
                      </Tooltip>
                    </TooltipContainer>
                  </DownloadContainer>
                )}
              </DetailResult>
              <DetailDesc>
                <DetailTitle>{apply.title}</DetailTitle>
                <DetailInfoes>
                  {apply.tags.map((tag) => {
                    return <DetailInfo key={tag}>{tag}</DetailInfo>;
                  })}
                  <DetailType $isPro={apply.plan === "pro"}>
                    {apply.plan === "pro" ? "프로" : "기본"}
                  </DetailType>
                </DetailInfoes>
                <DetailDescription>{apply.description}</DetailDescription>
              </DetailDesc>
              <DetailMetaData>
                <DetailData>
                  신청 날짜: {parseISOString(apply.appliedAt)}
                </DetailData>
                <DetailData>신청인: {apply.orderer.username}</DetailData>
              </DetailMetaData>
              <ApplyManage>
                {apply.isCompleted && (
                  <DeleteApply onClick={onCancel}>
                    {applyDeleteIsLoading
                      ? "신청 삭제하는 중.."
                      : "신청 삭제하기"}
                  </DeleteApply>
                )}
              </ApplyManage>
            </Detail>
            <Chat>
              <MessageList ref={ulRef}>
                {apply.chats.length > 0 || chats.length > 0 ? (
                  <>
                    {apply.chats.map((chat, index) => {
                      return (
                        <Message key={index} $isMe={chat.isMe}>
                          <MessageContainer>
                            {chat.isMe ? (
                              <MessageDate>
                                {parseISOString(chat.timestamp)}
                              </MessageDate>
                            ) : null}
                            <MessageContent $isMe={chat.isMe}>
                              {chat.message}
                              {chat.imageUrl && (
                                <ChatLazyImage
                                  onClick={() => {
                                    setOpenChat(chat.message);
                                    setCurrentImage(chat.imageUrl);
                                  }}
                                  src={chat.imageUrl}
                                />
                              )}
                            </MessageContent>
                            {!chat.isMe ? (
                              <MessageDate>
                                {parseISOString(chat.timestamp)}
                              </MessageDate>
                            ) : (
                              <DeleteMessage
                                onClick={() => onDeleteMessage(chat)}
                              >
                                <FontAwesomeIcon icon={faTrashCan} />
                              </DeleteMessage>
                            )}
                          </MessageContainer>
                        </Message>
                      );
                    })}
                    {chats.map((chat, index) => {
                      return (
                        <Message key={index} $isMe={chat.isMe}>
                          <MessageContainer>
                            {chat.isMe ? (
                              <MessageDate>
                                {parseISOString(chat.timestamp)}
                              </MessageDate>
                            ) : null}
                            <MessageContent $isMe={chat.isMe}>
                              {chat.message}
                              {chat.imageUrl && (
                                <ChatLazyImage
                                  onClick={() => {
                                    setOpenChat(chat.message);
                                    setCurrentImage(chat.imageUrl);
                                  }}
                                  src={chat.imageUrl}
                                />
                              )}
                            </MessageContent>
                            {!chat.isMe ? (
                              <MessageDate>
                                {parseISOString(chat.timestamp)}
                              </MessageDate>
                            ) : (
                              <DeleteMessage
                                onClick={() => onDeleteMessage(chat)}
                              >
                                <FontAwesomeIcon icon={faTrashCan} />
                              </DeleteMessage>
                            )}
                          </MessageContainer>
                        </Message>
                      );
                    })}
                  </>
                ) : (
                  <Notification>
                    🦄 멋진 결과를 위해 대화를 시작해보세요! 🦄
                  </Notification>
                )}
              </MessageList>
              <MessageForm onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence>
                  {chatFile && (
                    <MessageImageContainer
                      variants={messageImageVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      exit="exit"
                    >
                      <MessageImageTitle>함께 전송할 사진</MessageImageTitle>
                      <MessageImage $src={chatFile.imageUrl} />
                    </MessageImageContainer>
                  )}
                </AnimatePresence>
                <MessageUpload
                  $added={Boolean(chatFile)}
                  onClick={chatFile ? onDeleteImage : null}
                  htmlFor={chatFile ? "" : "chatImage"}
                >
                  <MessageUploadIcon icon={chatFile ? faXmark : faPlus} />
                </MessageUpload>
                <MessageFile
                  value={file}
                  onChange={onUpload}
                  type="file"
                  accept="image/*"
                  id="chatImage"
                />
                <MessageInput
                  {...register("message", { required: true })}
                  type="text"
                  autoComplete="off"
                  placeholder="메시지를 입력하세요."
                />
                <MessageButton
                  variants={messageButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={{ duration: 0.05 }}
                >
                  보내기
                </MessageButton>
              </MessageForm>
            </Chat>
            <Drafts>
              <DraftTitle>
                보낸 참고 사진 ({apply.drafts.length + newDrafts.length}/
                {apply.plan === "pro" ? "12" : "6"})
              </DraftTitle>
              <DraftList>
                {newDrafts?.map((draft, idx) => {
                  return (
                    <Draft
                      key={draft.imageUrl + idx + ""}
                      onClick={() => {
                        setDraftPath(draft.path);
                        setOpenDraft(draft.title);
                        setCurrentImage(draft.imageUrl);
                      }}
                      layoutId={draft.imageUrl}
                    >
                      <DraftLazyImage src={draft.imageUrl} alt="draftImage" />
                      <DraftDesc>{draft.title}</DraftDesc>
                    </Draft>
                  );
                })}
                {apply.drafts?.map((draft, idx) => {
                  return (
                    <Draft
                      key={idx}
                      onClick={() => {
                        setDraftPath(draft.path);
                        setOpenDraft(draft.title);
                        setCurrentImage(draft.imageUrl);
                      }}
                      layoutId={draft.imageUrl}
                    >
                      <DraftLazyImage src={draft.imageUrl} alt="draftImage" />
                      <DraftDesc>{draft.title}</DraftDesc>
                    </Draft>
                  );
                })}
              </DraftList>
              {(apply.plan === "pro" ? 12 : 6) >
                apply.drafts.length + newDrafts.length && (
                <DraftUploadButton htmlFor="uploadInput">
                  <TooltipContainer initial="initial" whileHover="hover">
                    <UploadIcon icon={faUpload} />
                    <FileInput
                      value={draftFile}
                      onChange={onChangeFile}
                      id="uploadInput"
                      type="file"
                      accept="image/*"
                    />
                    <Tooltip
                      variants={tooltipVariants}
                      transition={{ duration: 0.2 }}
                    >
                      {isLoading ? "업로드 중.." : "업로드"}
                    </Tooltip>
                  </TooltipContainer>
                </DraftUploadButton>
              )}
            </Drafts>
          </>
        ) : (
          <></>
        )}
      </Wrapper>
    </>
  );
};

export default DetailApply;
