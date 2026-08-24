import axios from "axios";

export const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// export const BASE_URL = 'https://foine-backend.herokuapp.com/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function pay(body) {
  body = {
    ...body,
    email: `${body.phone}${body.amount}foine@gmail.com`,
    paymentMethod: "mobile_money",
  };
  console.log({ body });
  try {
    const { data } = await client.post(
      "/transaction/charge/",
      JSON.stringify(body)
    );
    console.log("CHARGE");
    console.log(data);
    return data;
  } catch (e) {
    return { response: e.response, message: e.message };
  }
}

export async function confirmOTP(otp, reference) {
  try {
    const { data } = await client.post(
      "/transaction/verify-otp/",
      JSON.stringify({ otp, reference })
    );
    return data;
  } catch (e) {
    return { response: e.response, message: e.message };
  }
}

export async function signIn(body) {
  try {
    return await client.post("/user/signin/", JSON.stringify(body));
  } catch (e) {
    console.log(e);
  }
}

export async function signUp(body) {
  try {
    return await client.post("/user/signup/", JSON.stringify(body));
  } catch (e) {
    console.log(e);
  }
}

export async function requestHoldProduct(body) {
  try {
    return await client.post("/product/hold/", JSON.stringify(body));
  } catch (e) {
    console.log(e);
  }
}

export async function acceptRequest(body) {
  try {
    return await client.post("/product/accept-request/", JSON.stringify(body));
  } catch (e) {
    console.log(e);
  }
}

export async function getUserDetails(token) {
  try {
    return await client.get("/user/getdetails/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log(err.message);
    return err;
  }
}
