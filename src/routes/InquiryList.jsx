import styled from "styled-components";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase";
import { useRecoilValue } from "recoil";
import { isMobileAtom, widthAtom } from "../atom";

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding-top: 90px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 80vw;
  height: 700px;
  gap: 50px;
  padding: ${(props) => (props.$isMobile ? 0 : "30px")};
  box-sizing: border-box;
`;

const Order = styled.div`
  display: ${(props) => (props.$isSmall ? "block" : "grid")};
  grid-template-columns: 1fr 2fr;
  gap: 30px;
`;

const OrderPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: contain;
  overflow: hidden;
`;

const PreviewTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
`;

const PreviewDescription = styled.p`
  line-height: 1.1;
  height: 180px;
  width: 460px;
  overflow-wrap: break-word;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 600;
`;

const OrderList = styled.ul`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100%;
  height: fit-content;
`;

const OrderHeader = styled.header`
  display: grid;
  grid-template-columns: 60px 2fr 1fr 70px;
  place-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  font-weight: bold;
`;

const OrderNumber = styled.span`
  font-size: 16px;
  font-weight: bold;
`;

const OrderDate = styled.span`
  font-size: 15px;
  font-weight: bold;
`;

const OrderStatus = styled.span`
  font-size: 16px;
  color: ${(props) => (props.$isCompleted ? "green" : "red")};
  font-weight: bold;
`;

const OrderItem = styled(Link)`
  display: grid;
  grid-template-columns: 60px 2fr 1fr 70px;
  color: black;
  text-decoration: none;
  place-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const OrderTitle = styled.h2`
  font-size: 16px;
`;

const MobileItem = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid rgba(0, 0, 0, 0.4);
  padding: 15px;
  border-radius: 10px;
  color: black;
  text-decoration: none;
  margin-top: ${(props) => (props.$isFirst ? "" : "5px")};
`;

const MobileTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const MobileBottomBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MobileStatus = styled.h3`
  font-size: 16px;
  span {
    font-weight: bold;
    color: ${(props) => (props.$isCompleted ? "green" : "red")};
  }
`;

const MobileDate = styled.span`
  font-size: 14px;
`;

const LoadMore = styled.div`
  padding: 10px 0;
  box-sizing: border-box;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  background-color: #f4f4f4;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  width: 100%;
  cursor: pointer;
  margin-top: 5px;
`;

function parseISOString(string) {
  const strDate = string.substring(0, 10);
  const [y, m, d] = strDate.split("-");
  return `${y}년 ${+m}월 ${+d}일`;
}

const InquiryManagement = () => {
  const [hoverItem, setHoverItem] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loadMoreVisible, setLoadMoreVisible] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const pageSize = 20;
  const fetchInquiries = useCallback(async (pageSize, startAfterDoc) => {
    let inquiryQuery;
    try {
      if (startAfterDoc) {
        inquiryQuery = query(
          collection(db, "inquiries"),
          orderBy("isAnswered", "asc"),
          orderBy("createdAt", "desc"),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        inquiryQuery = query(
          collection(db, "inquiries"),
          orderBy("isAnswered", "asc"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
      const inquirySnap = await getDocs(inquiryQuery);
      if (inquirySnap.docs.length === 0) {
        return setLoadMoreVisible(false);
      } else {
        const docs = inquirySnap.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        if (docs.length === pageSize) {
          setLoadMoreVisible(true);
        } else {
          setLoadMoreVisible(false);
        }
        return {
          data: docs,
          lastVisible: inquirySnap.docs[inquirySnap.docs.length - 1],
        };
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  const loadMore = async () => {
    const result = await fetchInquiries(pageSize, lastVisible);
    if (!result) return;
    const { data: nextPageData, lastVisible: nextLastVisible } = result;
    setInquiries((prev) => [...prev, ...nextPageData]);
    setLastVisible(nextLastVisible);
  };
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchInquiries(pageSize, null);
      if (!result) return;
      const { data, lastVisible } = result;
      setInquiries((prev) => [...prev, ...data]);
      setLastVisible(lastVisible);
    };
    fetchData();
  }, [fetchInquiries]);
  let hoverData;
  if (hoverItem !== null) {
    hoverData = inquiries.find((inquiry) => inquiry.id === hoverItem);
  } else {
    hoverData = null;
  }
  const width = useRecoilValue(widthAtom);
  const isSmall = !(width > 1330);
  const isMobile = useRecoilValue(isMobileAtom);
  return (
    <>
      <Seo title="문의 관리" />
      <Wrapper>
        <Container $isMobile={isMobile}>
          <Title>문의 관리</Title>
          <Order $isSmall={isSmall}>
            {!isSmall && (
              <OrderPreview>
                {hoverData ? (
                  <>
                    <PreviewImage src="/img/inquiry.jpeg" />
                    <PreviewTitle>{hoverData.title}</PreviewTitle>
                    <PreviewDescription>{hoverData.content}</PreviewDescription>
                  </>
                ) : (
                  <>
                    <PreviewImage src="/img/smallLogo.jpeg" />
                    <PreviewTitle>문의를 선택해주세요.</PreviewTitle>
                    <PreviewDescription>
                      문의 위에 마우스를 올려보세요!
                    </PreviewDescription>
                  </>
                )}
              </OrderPreview>
            )}
            <OrderList onMouseLeave={() => setHoverItem(null)}>
              {!isMobile && (
                <OrderHeader>
                  <OrderNumber>번호</OrderNumber>
                  <OrderTitle>제목</OrderTitle>
                  <OrderDate>주문 날짜</OrderDate>
                  <span>상태</span>
                </OrderHeader>
              )}
              {inquiries.map((order, idx) =>
                isMobile ? (
                  <MobileItem
                    key={order.id}
                    $isFirst={idx === 0}
                    to={`/inquiry-management/${order.id}`}
                  >
                    <MobileTitle>
                      {order.title.length > 15
                        ? `${order.title.slice(0, 15)}...`
                        : order.title}
                    </MobileTitle>
                    <MobileBottomBar>
                      <MobileStatus $isCompleted={order.isAnswered}>
                        상태:{" "}
                        <span>{order.isAnswered ? "완료됨" : "대기 중"}</span>
                      </MobileStatus>
                      <MobileDate>
                        주문 날짜: {parseISOString(order.createdAt)}
                      </MobileDate>
                    </MobileBottomBar>
                  </MobileItem>
                ) : (
                  <OrderItem
                    onMouseEnter={() => setHoverItem(order.id)}
                    key={order.id}
                    to={`/inquiry-management/${order.id}`}
                  >
                    <OrderNumber>{inquiries.length - idx}</OrderNumber>
                    <OrderTitle>
                      {order.title.length > 15
                        ? `${order.title.slice(0, 15)}...`
                        : order.title}
                    </OrderTitle>
                    <OrderDate>{parseISOString(order.createdAt)}</OrderDate>
                    <OrderStatus $isCompleted={order.isAnswered}>
                      {order.isAnswered ? "완료됨" : "대기 중"}
                    </OrderStatus>
                  </OrderItem>
                )
              )}
              {loadMoreVisible && (
                <LoadMore onClick={loadMore}>더 불러오기</LoadMore>
              )}
            </OrderList>
          </Order>
        </Container>
      </Wrapper>
    </>
  );
};

export default InquiryManagement;
