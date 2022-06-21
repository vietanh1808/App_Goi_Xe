import {ILoginParams, IValidateForm} from '../../../models/login';
import {IRegisterForm, IRegisterValidate} from '../../../models/register';
import {IUpdateForm, IUpdateValidate} from '../../../models/Saler';

/* eslint-disable prettier/prettier */
const regEmail =
  /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const regPhone = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

const validateEmail = (text: string) => {
  if (!text) return 'Email không được để trống!';
  return String(text).toLowerCase().match(regEmail)
    ? ''
    : 'Email không hợp lệ!';
};

const validatePhoneNumber = (value: string) => {
  if (!value) return 'Yêu cầu nhập số điện thoại!';
  return String(value).toLocaleLowerCase().match(regPhone)
    ? ''
    : 'Số điện thoại không hợp lệ!';
};

const validRegister = (value: string, name: string) => {
  if (value) return '';
  switch (name) {
    case 'username':
      return 'Yêu cầu họ tên!';
    case 'birthday':
      return 'Yêu cầu nhập ngày sinh!';
    case 'sex':
      return 'Yêu cầu chọn giới tính!';
    case 'author':
      return 'Yêu cầu chọn kiểu người dùng!';
    case 'carType':
      return 'Yêu cầu chọn loại xe!';
    default:
      return '';
  }
};

export const validatePassword = (text: string) => {
  if (!text) return 'Mật khẩu không được để trống';
  return text.length >= 6 ? '' : 'Mật khẩu phải lớn hơn 6 ký tự!';
};

export const validateForm = (form: ILoginParams): IValidateForm => {
  return {
    username: validateEmail(form.username),
    password: validatePassword(form.password),
  };
};

export const isValidForm = (form: IValidateForm) => {
  return !form.username && !form.password;
};

export const validateRegisterForm = (
  form: IRegisterForm,
): IRegisterValidate => {
  return {
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    phone: validatePhoneNumber(form.phone),
    username: validRegister(form.username, 'username'),
    birthday: validRegister(form.birthday, 'birthday'),
    authorization: validRegister(form.authorization, 'author'),
    sex: validRegister(form.sex, 'sex'),
  };
};

export const isValidRegisterForm = (form: IRegisterValidate) => {
  return (
    !form.email &&
    !form.username &&
    !form.password &&
    !form.phone &&
    !form.birthday &&
    !form.authorization &&
    !form.sex
  );
};

export const validateUpdateForm = (form: IUpdateForm): IUpdateValidate => {
  return {
    email: validateEmail(form.email),
    phone: validatePhoneNumber(form.phone),
    username: validRegister(form.username, 'username'),
  };
};

export const isValidUpdateForm = (form: IUpdateValidate) => {
  return !form.email && !form.username && !form.phone;
};
