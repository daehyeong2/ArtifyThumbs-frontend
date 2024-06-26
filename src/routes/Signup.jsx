import styled from "styled-components";
import Seo from "../components/Seo";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SocialLogin from "../components/social-login";
import { FirebaseError } from "firebase/app";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 35px 50px;
  border-radius: 30px;
  transition: 0.2s;
  z-index: 1;
  background-color: white;
  &:hover {
    box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  }
`;

const Overlay = styled.div`
  position: absolute;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  background-image: url("/img/background/home.jpeg");
  background-repeat: no-repeat;
  background-position: 67vw 50vh;
  background-size: 400px;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
`;

const Input = styled.input`
  width: 250px;
  height: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &:focus-within {
    border: 1px solid #0984e3;
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SignUpButton = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #0984e3;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 5px;
  &:hover {
    background-color: #0097e6;
  }
`;

const FormTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 20px;
`;

const LoginLink = styled(Link)`
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
  color: rgba(0, 0, 0, 0.6);
  text-decoration: none;
  transition: 0.1s;
  width: fit-content;
  &:hover {
    color: #0097e6;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  width: 270px;
  line-height: 1.2;
  font-size: 0.8rem;
  font-weight: 600;
  color: #d63031;
`;

const Password = styled.div`
  position: relative;
`;

const PasswordShow = styled.label`
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  top: 0;
  bottom: 0;
  user-select: none;
  svg {
    cursor: pointer;
  }
`;

const CheckBoxInput = styled.input`
  width: 1rem;
`;

const CheckBoxLabel = styled.label`
  font-size: 16px;
  max-width: 250px;
  line-height: 1.3;
  a {
    color: #0984e3;
  }
`;

const CheckBox = styled.div`
  display: flex;
  max-width: 275px;
  gap: 8px;
`;

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm();
  const [isLoading, setLoading] = useState(false);
  const [passwordShow, setPasswordShow] = useState(false);
  const [error, setError] = useState(false);
  const onSubmit = async (data) => {
    setError("");
    if (isLoading) return;
    if (!data.agreeTerms)
      return setError("이용약관 및 개인정보 처리방침에 동의하셔야 합니다");
    if (data.passwordConfirmation !== data.password) {
      return setFormError(
        "passwordConfirmation",
        {
          message: "확인 비밀번호가 일치하지 않습니다.",
        },
        {
          shouldFocus: true,
        }
      );
    }
    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(credentials.user, {
        displayName: data.username,
        photoURL: "/img/user.jpeg",
      });
      const userRef = doc(db, "users", credentials.user.uid);
      await setDoc(userRef, {
        username: data.username,
        email: data.email,
        isAdmin: true,
        createdAt: Date.now(),
        userId: credentials.user.uid,
        photoURL: "/img/user.jpeg",
        isSocial: false,
      });
      window.location.href = "/";
    } catch (e) {
      if (e instanceof FirebaseError) {
        switch (e.code) {
          case "auth/email-already-in-use":
            setFormError(
              "email",
              { message: "이미 등록된 이메일입니다." },
              { shouldFocus: true }
            );
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const toggleShow = () => {
    setPasswordShow((prev) => !prev);
  };
  return (
    <>
      <Seo
        title="회원가입"
        description="ArtifyThumbs의 계정을 만들어서 원하는 그림을 신청해 보세요!"
      />
      <Wrapper>
        <Overlay />
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormTitle>회원가입</FormTitle>
          <InputContainer>
            <Label htmlFor="email">이메일을 입력해 주세요.</Label>
            <Input
              {...register("email", {
                required: "이메일을 입력해 주세요.",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "올바른 이메일 형식으로 입력해주세요.",
                },
              })}
              placeholder="이메일"
              autoComplete="username"
              id="email"
              name="email"
            ></Input>
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </InputContainer>
          <InputContainer>
            <Label htmlFor="username">아이디를 입력해 주세요.</Label>
            <Input
              {...register(
                "username",
                {
                  required: "아이디를 입력해 주세요.",
                  pattern: {
                    value: /^[a-zA-Z0-9]{4,12}$/,
                    message:
                      "아이디는 4~12자의 영문 대소문자와 숫자로만 입력해주세요.",
                  },
                },
                { maxLength: 12 },
                { minLength: 4 }
              )}
              placeholder="아이디"
              autoComplete="off"
              id="username"
              name="username"
            ></Input>
            {errors.username && (
              <ErrorMessage>{errors.username.message}</ErrorMessage>
            )}
          </InputContainer>
          <InputContainer>
            <Label htmlFor="password">비밀번호를 입력해 주세요.</Label>
            <Password>
              <Input
                {...register("password", {
                  required: "비밀번호를 입력해 주세요.",
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,32}$/,
                    message:
                      "확인 비밀번호는 영어, 숫자를 포함하고 최소 8자 이상, 최대 32자 이하이여야 합니다.",
                  },
                })}
                placeholder="비밀번호"
                autoComplete="off"
                id="password"
                name="password"
                type={passwordShow ? "text" : "password"}
              ></Input>
              <PasswordShow>
                <FontAwesomeIcon
                  onClick={toggleShow}
                  icon={passwordShow ? faEyeSlash : faEye}
                />
              </PasswordShow>
            </Password>
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </InputContainer>
          <InputContainer>
            <Label htmlFor="passwordConfirmation">
              비밀번호를 다시 입력해 주세요.
            </Label>
            <Input
              {...register("passwordConfirmation", {
                required: "확인 비밀번호를 입력해 주세요.",
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,32}$/,
                  message:
                    "확인 비밀번호는 영어, 숫자를 포함하고 최소 8자 이상, 최대 32자 이하이여야 합니다.",
                },
              })}
              placeholder="비밀번호 확인"
              autoComplete="off"
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
            ></Input>
            {errors.passwordConfirmation && (
              <ErrorMessage>{errors.passwordConfirmation.message}</ErrorMessage>
            )}
          </InputContainer>
          <CheckBox>
            <CheckBoxInput
              {...register("agreeTerms")}
              type="checkbox"
              id="terms"
            />
            <CheckBoxLabel htmlFor="terms">
              <Link to="/policies/terms">ArtifyThumbs 이용약관</Link>과{" "}
              <Link to="/policies/privacy-policy">개인정보 수집 및 이용</Link>에
              동의합니다.
            </CheckBoxLabel>
          </CheckBox>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SignUpButton>
            {isLoading ? "가입하는 중.." : "가입하기"}
          </SignUpButton>
          <LoginLink to="/signin">계정이 이미 있으신가요?</LoginLink>
          <SocialLogin />
        </Form>
      </Wrapper>
    </>
  );
};

export default Signup;
