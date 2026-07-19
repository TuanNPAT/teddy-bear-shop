import * as z from 'zod';

export const PHONE_REGEX = /^(0[35789])([0-9]{8})$/;

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, {
    message: 'Số điện thoại không hợp lệ (phải đủ 10 số, bắt đầu bằng 03/05/07/08/09)',
  });
