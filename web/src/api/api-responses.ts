import { SuccessfulAPIResponse } from "./api";

export interface Spec {
  name: string,
  score: number,
  description: string|null
}

export interface SpecConfig {
  speed: Spec,
  quality: Spec
}

export interface Feature {
  name: string,
  description: string
}

export interface SeparatorConfig {
  key: string,
  name: string,
  url: string,
  description: string,
  specs: SpecConfig,
  features: Feature[],
  logo_url: string|null,
  enabled: boolean,
  schema: any
}
export interface LoginConfig {
  login_enabled: boolean,
  google_login: boolean,
  apple_login: boolean
}

export interface AppConfig {
  separator_config: SeparatorConfig[],
  default_separator: string,
  login_features: LoginConfig
}

interface UserHistoryEntry {
    title: string
}
export type UserHistory = UserHistoryEntry[]

/* Responses */
export type AppConfigResponse = SuccessfulAPIResponse<AppConfig>
export type HistoryResponse = SuccessfulAPIResponse<UserHistory>
export type LoginResponse = SuccessfulAPIResponse<null>
export type RegisterResponse = SuccessfulAPIResponse<null>
export type LogoutResponse = SuccessfulAPIResponse<null>