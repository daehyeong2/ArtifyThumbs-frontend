import { Navigate } from "react-router";
import { getUser } from "../api";
import { useQuery } from "react-query";

const SecurePage = ({ element, authenticatedOnly, guestOnly, adminOnly }) => {
  const { data, isLoading } = useQuery(["user-info"], getUser);
  if (isLoading) {
    return null;
  }
  const user = data?.user;
  if (authenticatedOnly && !user) {
    alert("로그인이 필요한 서비스입니다.");
    return <Navigate to="/signin" replace />;
  } else if (guestOnly && user) {
    alert("로그인 중일 때는 사용하실 수 없습니다.");
    return <Navigate to="/" replace />;
  } else if (adminOnly && user?.role !== "admin") {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" />;
  }

  return element;
};

export default SecurePage;
