import { motion } from "framer-motion";
import styled from "styled-components";
import TopButton from "../components/TopButton";
import Seo from "../components/Seo";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
`;

const ContainerTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  span {
    background: linear-gradient(to right top, #55efc4, #00b894);
    color: transparent;
    background-clip: text;
  }
`;

const ContainerSubtitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 900;
  line-height: 25px;
  color: rgba(0, 0, 0, 0.6);
`;

const About = styled.div`
  display: flex;
  width: 100%;
  height: 250px;
  justify-content: center;
  align-items: center;
  gap: 60px;
  margin-bottom: 150px;
`;

const AboutInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  width: 500px;
`;

const AboutImage = styled.img`
  width: 400px;
  height: 200px;
  background-color: #f4f4f4;
`;

const AboutTitle = styled.h2`
  font-size: 2rem;
`;

const AboutContent = styled.p`
  font-size: 1.1rem;
  line-height: 25px;
`;

const ContainerStartButton = styled(motion.button)`
  padding: 8px 18px;
  background-color: #0984e3;
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
`;

const startVariants = {
  hover: {
    backgroundColor: "#0097e6",
    transition: {
      duration: 0.05,
    },
  },
};

const Home = () => {
  return (
    <>
      <Seo title="홈" />
      <Wrapper>
        <TopButton />
        <Container id="main">
          <ContainerTitle>
            쉽고, <span>완벽한.</span>
          </ContainerTitle>
          <ContainerSubtitle>
            ArtifyThumbs에서 쉽고 빠르게 좋은 그림을 받아보세요.
          </ContainerSubtitle>
          <ContainerStartButton variants={startVariants} whileHover="hover">
            시작하기
          </ContainerStartButton>
        </Container>
        <About>
          <AboutImage src="/img/various.png" alt="various" />
          <AboutInfo>
            <AboutTitle>다양한 그림 종류</AboutTitle>
            <AboutContent>
              ArtifyThumbs에서는 게임 일러스트, 캐릭터 일러스트, 유튜브 썸네일,
              프로필 사진, 프로필 배너 등 많은 그림들을 그릴 수 있습니다.
            </AboutContent>
          </AboutInfo>
        </About>
        <About>
          <AboutInfo>
            <AboutTitle>간편한 신청</AboutTitle>
            <AboutContent>
              쉽게 가입하고 원하는 그림을 신청하세요. 좋은 퀄리티로 빠르게 받아
              볼 수 있습니다.
            </AboutContent>
          </AboutInfo>
          <AboutImage src="/img/convenient.png" alt="convenient" />
        </About>
      </Wrapper>
    </>
  );
};

export default Home;
