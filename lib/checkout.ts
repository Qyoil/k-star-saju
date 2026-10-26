// lib/checkout.ts
// Lemon Squeezy 결제 설정 (결과 화면 배너 + 리포트 뷰어 공용). 가격만 바꾸면 할인율(%)은 자동 계산됩니다.
export const CHECKOUT_URL = "https://k-star-saju.lemonsqueezy.com/checkout/buy/9351c991-d085-4ebe-a0f8-984e30dac440";
export const PRICE = 3.99;
export const LIST_PRICE = 6.99;
export const OFF_PCT = Math.round((1 - PRICE / LIST_PRICE) * 100);
export const usd = (n: number) => `$${n.toFixed(2)}`;
