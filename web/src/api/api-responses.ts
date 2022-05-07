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

export interface ExampleStem {
  name: string,
  // Path to stem.
  path: string,
  // Path to original (if available).
  original: string|null,
  source: boolean
}

export interface Example {
  name: string,
  stems: ExampleStem[]
}

export interface SchemaArgs {
  [arg: string]: object
}

export interface Schema {
  $schema: string,
  type: "object",
  properties: SchemaArgs
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
  examples: Example[]
  schema: Schema
}

export interface LoginState {

}

export interface AppConfig {
  separator_config: SeparatorConfig[],
  default_separator: string,
  login_state: LoginState | null
}

interface UserHistoryEntry {
    title: string
}
export type UserHistory = UserHistoryEntry[]

export type CeleryState = (
  "FAILURE" | "PENDING" | "RECEIVED" |
  "RETRY" | "REVOKED" | "STARTED" |
  "SUCCESS"
)

export interface MonitorSeparationData {

}

export type StemType = "SOURCE" | "OTHER" | "VOCALS" | "DRUMS" | "BASS" | "PIANO"

export interface SeparationFile {
  id: string,
  file_name?: string,
  stem_type: StemType,
  ready: boolean,
  creation_date: number | null
}

export interface Separation {
  id: string,
  separator: string,
  files: SeparationFile[],
  user: string,
  creation_date: number | null
}

export interface MonitorSeparationState {
  state: CeleryState,
  data: MonitorSeparationData,
  separation: Separation,
  queue_position: number | null
}

/* Responses */
export type AppConfigResponse = SuccessfulAPIResponse<AppConfig>
export type HistoryResponse = SuccessfulAPIResponse<UserHistory>
export type UploadSeparateResponse = SuccessfulAPIResponse<{
  id: string
}>
export type MonitorSeparationResponse = SuccessfulAPIResponse<MonitorSeparationState>
export type LoginResponse = SuccessfulAPIResponse<null>
export type RegisterResponse = SuccessfulAPIResponse<null>
export type LogoutResponse = SuccessfulAPIResponse<null>