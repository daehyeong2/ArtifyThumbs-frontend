import styled from "styled-components";
import Seo from "../components/Seo";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Link } from "react-scroll";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const InquirySection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  height: 400px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  width: 700px;
  box-sizing: border-box;
  border-radius: 20px;
  transition: 0.1s;
  &:hover {
    box-shadow: 2px 2px 5px 3px rgba(0, 0, 0, 0.13);
  }
`;

const Title = styled.h1`
  font-size: 40px;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 13px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  width: 100%;
  height: 45px;
  padding: 15px;
  font-size: 16px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  outline: none;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 70%;
  box-sizing: border-box;
  font-size: 16px;
  padding: 10px 15px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  outline: none;
  resize: none;
`;

const Button = styled.button`
  width: 100%;
  height: 45px;
  background-color: #0984e3;
  color: white;
  font-size: 20px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  transition: 0.1s;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  cursor: pointer;
  &:hover {
    background-color: #0097e6;
  }
`;

const QnA = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  height: 100vh;
  padding-top: 200px;
  width: 700px;
  box-sizing: border-box;
`;

const QnAContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const QnAItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Q = styled.h2`
  font-size: 25px;
  font-weight: 600;
`;

const A = styled.p`
  font-size: 20px;
`;

const Message = styled(motion.div)`
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  i {
    font-size: 25px;
  }
`;

const MessageVariants = {
  initial: {
    y: 20,
  },
  animate: {
    y: 0,
  },
};

const Inquiry = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <>
      <Seo title="문의하기" />
      <Wrapper>
        <InquirySection>
          <Container>
            <Title>문의하기</Title>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <InputContainer>
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="문의 제목을 입력하세요."
                  {...register("title")}
                />
                <Input
                  type="email"
                  autoComplete="off"
                  placeholder="이메일을 입력하세요."
                  {...register("email")}
                />
              </InputContainer>
              <TextArea
                autoComplete="off"
                placeholder="문의 내용을 입력해주세요."
                {...register("content")}
              />
              <Button>문의 등록하기</Button>
            </Form>
          </Container>
          <Link to="qna" smooth={true} duration={500}>
            <Message
              variants={MessageVariants}
              initial="initial"
              animate="animate"
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.5,
                type: "just",
              }}
            >
              <i class="fa-solid fa-arrow-down"></i>
              자주 묻는 질문
              <i class="fa-solid fa-arrow-down"></i>
            </Message>
          </Link>
        </InquirySection>
        <QnA id="qna">
          <Title>자주 묻는 질문</Title>
          <QnAContainer>
            <QnAItem>
              <Q>Q. 문의한 내용은 어떻게 확인하나요?</Q>
              <A>
                A. 문의한 내용은 이메일로 확인하실 수 있습니다. 문의한 내용에
                대한 답변은 최대 7일 이내에 이메일로 보내드립니다.
              </A>
            </QnAItem>
            <QnAItem>
              <Q>Q. 어떤 종류의 문의를 해야하나요?</Q>
              <A>A. 궁금한 점이라면 무엇이든 문의 하실 수 있습니다.</A>
            </QnAItem>
            <QnAItem>
              <Q>Q. 이메일 정보는 안전한가요?</Q>
              <A>A. 네, 입력하신 이메일은 단순 회신용으로만 사용됩니다.</A>
            </QnAItem>
          </QnAContainer>
        </QnA>
      </Wrapper>
    </>
  );
};

export default Inquiry;
