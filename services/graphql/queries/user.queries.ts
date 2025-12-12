import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on UserType {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    barNumber
    phone
    avatar
    title
    department
    bio
    mfaEnabled
    lastLoginAt
    createdAt
    updatedAt
  }
`;

export const GET_USERS = gql`
  ${USER_FRAGMENT}
  query GetUsers($filter: UserFilterInput, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      ...UserFields
    }
  }
`;

export const GET_USER = gql`
  ${USER_FRAGMENT}
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`;

export const GET_CURRENT_USER = gql`
  ${USER_FRAGMENT}
  query GetCurrentUser {
    me {
      ...UserFields
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      expiresIn
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

export const UPDATE_USER = gql`
  ${USER_FRAGMENT}
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
`;

export const UPDATE_PROFILE = gql`
  ${USER_FRAGMENT}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const ENABLE_MFA = gql`
  mutation EnableMFA {
    enableMFA {
      secret
      qrCode
    }
  }
`;

export const VERIFY_MFA = gql`
  mutation VerifyMFA($token: String!) {
    verifyMFA(token: $token)
  }
`;

export const DISABLE_MFA = gql`
  mutation DisableMFA($password: String!) {
    disableMFA(password: $password)
  }
`;
