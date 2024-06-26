import styled from "styled-components";
import NavAccount from "./NavAccount";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Link, useMatch } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { isMobileAtom, userAtom, widthAtom } from "../atom";
import CustomLink from "./CustomLink";
import MotionLink from "./MotionLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import MenuAccount from "./MenuAccount";

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoLink = styled(CustomLink)`
  height: 100%;
  margin-left: 10px;
`;

const Logo = styled.div`
  background-image: url("/img/Logo.jpeg");
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  margin: 0 auto;
  width: 250px;
  height: 100%;
  cursor: pointer;
`;

const Nav = styled(motion.nav)`
  height: 85px;
  padding: 20px 75px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 250px minmax(340px, 1fr) ${(props) =>
      props.$isLoggedIn ? "40px" : "170px"};
  width: 100vw;
  position: fixed;
  z-index: 2;
  border: ${(props) =>
    props.$isBorderExist ? "1px solid rgba(0, 0, 0, 0.1)" : "none"};
  > *:not(:first-child) {
    display: ${(props) => (props.$isMobile ? "none" : "flex")};
  }
  @media only screen and (max-width: 885px) {
    padding: 10px 0;
    grid-template-columns: 1fr;
  }
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3vw;
`;

const NavItem = styled(motion.li)`
  cursor: pointer;
  position: relative;
  a {
    text-decoration: none;
    font-size: 20px;
    font-weight: 600;
  }
`;

const UnderLine = styled(motion.div)`
  position: absolute;
  background-color: #74b9ff;
  height: 2px;
  bottom: -7px;
`;

const NavFolder = styled(motion.li)`
  cursor: pointer;
  position: relative;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  user-select: none;
  transition: color 0.1s ease-in-out;

  color: ${(props) =>
    props.$isActive ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.25)"};
  &:hover {
    color: rgba(0, 0, 0, 1);
  }
`;

const NavFolderList = styled(motion.ul)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 7px;
  background-color: white;
  position: absolute;
  width: fit-content;
  top: 30px;
`;

const NavFolderItem = styled(Link)`
  color: black;
  text-decoration: none;
  font-size: 16px;
  font-weight: normal;
  opacity: 0.6;
  width: max-content;
  &:hover {
    opacity: 1;
  }
`;

const Menu = styled.section`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  @media only screen and (max-width: 885px) {
    display: block;
  }
`;

const MenuIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: ${(props) => (props.$isRight ? "" : "23px")};
  right: ${(props) => (props.$isRight ? "25px" : "")};
  top: ${(props) => (props.$isRight ? "42px" : "32px")};
  font-size: 24px;
  cursor: pointer;
`;

const MenuList = styled(motion.ul)`
  padding: 20px 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: 80px repeat(auto-fill, 35px);
  gap: 3px;
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  z-index: 99;
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  padding-left: 30px;
  gap: 8px;
  margin-bottom: 20px;
  span {
    font-size: 22px;
    font-weight: bold;
    transform: translateY(3px);
  }
`;

const MenuItem = styled(Link)`
  font-size: 16px;
  border-radius: 7px;
  color: black;
  text-decoration: none;
  transition: background-color 0.1s ease-in-out;
  display: flex;
  padding: 0 30px;
  align-items: center;
  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
`;

const MenuLogo = styled.div`
  background-image: url("/img/smallLogo.jpeg");
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  height: 90%;
  aspect-ratio: 1 / 1;
`;

const Overylay = styled(motion.div)`
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
`;

const MenuTitle = styled.h3`
  font-size: 17px;
  font-weight: bold;
  padding-left: 17px;
  padding-bottom: 5px;
  display: flex;
  align-items: flex-end;
  color: rgba(0, 0, 0, 0.5);
`;

const NavItemVariants = {
  initial: {
    color: "rgba(0,0,0,0.25)",
    transition: {
      duration: 0.1,
    },
  },
  animate: {
    color: "rgb(0,0,0)",
    transition: {
      duration: 0.05,
    },
  },
  hover: {
    color: "rgb(0,0,0)",
    transition: {
      duration: 0.05,
    },
  },
};

const UnderLineVariants = {
  initial: {
    width: "0%",
    height: "2px",
  },
  hover: {
    width: "100%",
    transition: {
      duration: 0.25,
    },
  },
};

const NavVariants = {
  initial: {
    border: "1px solid rgba(0, 0, 0, 0)",
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  scrolled: {
    border: "1px solid rgba(0, 0, 0, 0.15)",
    backgroundColor: "rgba(255,255,255,1)",
  },
};

const BorderNavVariants = {
  initial: {
    border: "1px solid rgba(0, 0, 0, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  scrolled: {
    backgroundColor: "rgba(255,255,255,1)",
  },
};

const FolderVariants = {
  initial: {
    opacity: 0,
    y: -8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.1,
      delay: 0.1,
    },
  },
};

const MenuVariants = {
  initial: {
    x: "-100%",
  },
  animate: {
    x: 0,
    transition: {
      type: "linear",
      duration: 0.2,
    },
  },
  exit: {
    x: "-100%",
    transition: {
      type: "linear",
      duration: 0.2,
    },
  },
};

const OverylayVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const NavBar = () => {
  const userData = useRecoilValue(userAtom);
  const isMobile = useRecoilValue(isMobileAtom);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const width = useRecoilValue(widthAtom);
  const homeMatch = useMatch("/");
  const aboutMatch = useMatch("/about");
  const applyListMatch = useMatch("/apply-list");
  const DetailApplyMatch = useMatch("/apply-list/:applyId");
  const applyMatch = useMatch("/apply");
  const applyProcedureMatch = useMatch("/apply/procedure");
  const inquiryMatch = useMatch("/inquiry");
  const orderManagementMatch = useMatch("/order-management");
  const orderManagementDetailMatch = useMatch("/order-management/:orderId");
  const inquiryManagementMatch = useMatch("/inquiry-management");
  const inquiryManagementDetailMatch = useMatch(
    "/inquiry-management/:inquiryId"
  );
  const signinMatch = useMatch("/signin");
  const signupMatch = useMatch("/signup");
  const { scrollY } = useScroll();
  const handleScroll = useCallback((latest) => {
    setCurrentScrollY(latest);
  }, []);
  useMotionValueEvent(scrollY, "change", handleScroll);
  const isBorderExist = signinMatch || signupMatch;
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = () => {
    if (menuOpen) {
      document.body.style.overflow = "unset";
    } else {
      document.body.style.overflow = "hidden";
    }
    setMenuOpen((prev) => !prev);
  };
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = "unset";
      setMenuOpen(false);
    }
  }, [isMobile]);
  return (
    <Nav
      $isBorderExist={isBorderExist}
      $isLoggedIn={userData}
      $isMobile={isMobile}
      variants={isBorderExist ? BorderNavVariants : NavVariants}
      initial="initial"
      animate={currentScrollY > 80 ? "scrolled" : "initial"}
      transition={{ duration: 0.2 }}
    >
      <MenuContainer>
        <Menu>
          <MenuIcon onClick={menuToggle} icon={faBars} />
          <AnimatePresence>
            {menuOpen ? (
              <>
                <MenuList
                  variants={MenuVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <MenuHeader>
                    <MenuLogo />
                    <span>메뉴</span>
                    <MenuIcon
                      $isRight={true}
                      onClick={menuToggle}
                      icon={faBars}
                    />
                  </MenuHeader>
                  <MenuTitle>일반</MenuTitle>
                  <MenuItem to="/" onClick={menuToggle}>
                    홈
                  </MenuItem>
                  <MenuItem to="/about" onClick={menuToggle}>
                    소개
                  </MenuItem>
                  <MenuItem to="/inquiry" onClick={menuToggle}>
                    문의하기
                  </MenuItem>
                  {userData && (
                    <>
                      <MenuTitle>그림</MenuTitle>
                      <MenuItem to="/apply-list" onClick={menuToggle}>
                        신청 목록
                      </MenuItem>
                      <MenuItem to="/apply" onClick={menuToggle}>
                        신청하기
                      </MenuItem>
                      {userData.isAdmin && (
                        <>
                          <MenuTitle>관리</MenuTitle>
                          <MenuItem to="/order-management" onClick={menuToggle}>
                            주문 관리
                          </MenuItem>
                          <MenuItem
                            to="/inquiry-management"
                            onClick={menuToggle}
                          >
                            문의 관리
                          </MenuItem>
                        </>
                      )}
                    </>
                  )}
                  <MenuAccount menuToggle={menuToggle} />
                </MenuList>
                <Overylay
                  variants={OverylayVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onClick={menuToggle}
                />
              </>
            ) : null}
          </AnimatePresence>
        </Menu>
        <LogoLink to="/">
          <Logo />
        </LogoLink>
      </MenuContainer>
      <NavList>
        <NavItem
          initial="initial"
          animate={homeMatch ? "animate" : "initial"}
          whileHover="hover"
        >
          <div>
            <MotionLink to="/" variants={NavItemVariants}>
              홈
            </MotionLink>
          </div>
          <UnderLine variants={UnderLineVariants} />
        </NavItem>
        <NavItem
          initial="initial"
          animate={aboutMatch ? "animate" : "initial"}
          whileHover="hover"
        >
          <div>
            <MotionLink to="/about" variants={NavItemVariants}>
              소개
            </MotionLink>
          </div>
          <UnderLine variants={UnderLineVariants} />
        </NavItem>
        <NavItem
          initial="initial"
          animate={inquiryMatch ? "animate" : "initial"}
          whileHover="hover"
        >
          <div>
            <MotionLink to="/inquiry" variants={NavItemVariants}>
              문의하기
            </MotionLink>
          </div>
          <UnderLine variants={UnderLineVariants} />
        </NavItem>
        {userData && (
          <>
            {width > 1220 ? (
              <>
                <NavItem
                  initial="initial"
                  animate={
                    applyListMatch || DetailApplyMatch ? "animate" : "initial"
                  }
                  whileHover="hover"
                >
                  <div>
                    <MotionLink to="/apply-list" variants={NavItemVariants}>
                      신청 목록
                    </MotionLink>
                  </div>
                  <UnderLine variants={UnderLineVariants} />
                </NavItem>
                <NavItem
                  initial="initial"
                  animate={
                    applyMatch || applyProcedureMatch ? "animate" : "initial"
                  }
                  whileHover="hover"
                >
                  <div>
                    <MotionLink to="/apply" variants={NavItemVariants}>
                      신청하기
                    </MotionLink>
                  </div>
                  <UnderLine variants={UnderLineVariants} />
                </NavItem>
              </>
            ) : (
              <NavFolder
                onMouseEnter={() => setIsApplyOpen(true)}
                onMouseLeave={() => setIsApplyOpen(false)}
                $isActive={applyListMatch || applyMatch || DetailApplyMatch}
              >
                그림
                <AnimatePresence>
                  {isApplyOpen ? (
                    <NavFolderList
                      variants={FolderVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <NavFolderItem to="/apply-list">신청 목록</NavFolderItem>
                      <NavFolderItem to="/apply">신청하기</NavFolderItem>
                    </NavFolderList>
                  ) : null}
                </AnimatePresence>
              </NavFolder>
            )}
            {userData?.isAdmin && width > 1740 ? (
              <>
                <NavItem
                  initial="initial"
                  animate={
                    orderManagementMatch || orderManagementDetailMatch
                      ? "animate"
                      : "initial"
                  }
                  whileHover="hover"
                >
                  <div>
                    <MotionLink
                      to="/order-management"
                      variants={NavItemVariants}
                    >
                      주문 관리
                    </MotionLink>
                  </div>
                  <UnderLine variants={UnderLineVariants} />
                </NavItem>
                <NavItem
                  initial="initial"
                  animate={
                    inquiryManagementMatch || inquiryManagementDetailMatch
                      ? "animate"
                      : "initial"
                  }
                  whileHover="hover"
                >
                  <div>
                    <MotionLink
                      to="/inquiry-management"
                      variants={NavItemVariants}
                    >
                      문의 목록
                    </MotionLink>
                  </div>
                  <UnderLine variants={UnderLineVariants} />
                </NavItem>
              </>
            ) : (
              userData?.isAdmin && (
                <NavFolder
                  onMouseEnter={() => setIsFolderOpen(true)}
                  onMouseLeave={() => setIsFolderOpen(false)}
                  $isActive={
                    orderManagementMatch ||
                    inquiryManagementMatch ||
                    orderManagementDetailMatch ||
                    inquiryManagementDetailMatch
                  }
                >
                  관리
                  <AnimatePresence>
                    {isFolderOpen ? (
                      <NavFolderList
                        variants={FolderVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <NavFolderItem to="/order-management">
                          주문 관리
                        </NavFolderItem>
                        <NavFolderItem to="/inquiry-management">
                          문의 관리
                        </NavFolderItem>
                      </NavFolderList>
                    ) : null}
                  </AnimatePresence>
                </NavFolder>
              )
            )}
          </>
        )}
      </NavList>
      <NavAccount />
    </Nav>
  );
};

export default NavBar;
