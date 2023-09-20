import { EventEmitter } from "events";
import * as puppeteer from "puppeteer";

declare namespace GCWebJS {
  export class GClient extends EventEmitter {
    constructor(options: ClientOptions);

    /** Puppeteer page running WhatsApp Web */
    pupPage?: puppeteer.Page;

    /** Puppeteer browser running WhatsApp Web */
    pupBrowser?: puppeteer.Browser;

    initialize(): Promise<void>;

    searchNumber(
      countryCode: string,
      phoneNumber: PhoneNumber
    ): Promise<PhoneNumber>;

    /** Generic event */
    on(event: string, listener: (...args: any) => void): this;

    /** Emitted when there has been an error while trying to restore an existing session */
    on(event: "auth_failure", listener: (message: string) => void): this;

    /** Emitted when the client has been disconnected */
    on(
      event: "disconnected",
      listener: (
        /** reason that caused the disconnect */
        reason: GCState | "NAVIGATION"
      ) => void
    ): this;

    /** Emitted when the QR code is received */
    on(
      event: "qr",
      listener: (
        /** qr code string
         *  @example ```1@9Q8tWf6bnezr8uVGwVCluyRuBOJ3tIglimzI5dHB0vQW2m4DQ0GMlCGf,f1/vGcW4Z3vBa1eDNl3tOjWqLL5DpYTI84DMVkYnQE8=,ZL7YnK2qdPN8vKo2ESxhOQ==``` */
        qr: string
      ) => void
    ): this;

    /** Emitted when the client has initialized and is ready to receive messages */
    on(event: "ready", listener: () => void): this;
  }

  export interface PhoneNumber {
    /** String that represent from name */
    name: string;
    /** String that represent from phone_number . */
    phone_number: string;
    /** String that represents from provider */
    provider: string;
    /** localStorage content */
    localStorage: object;
  }

  export interface LocalWebCacheOptions {
    type: "local";
    path?: string;
    strict?: boolean;
  }
  export type WebCacheOptions =
    | NoWebCacheOptions
    | LocalWebCacheOptions
    | RemoteWebCacheOptions;

  /**
   * Base class which all authentication strategies extend
   */
  export abstract class AuthStrategy {
    setup: (client: GClient) => void;
    beforeBrowserInitialized: () => Promise<void>;
    afterBrowserInitialized: () => Promise<void>;
    onAuthenticationNeeded: () => Promise<{
      failed?: boolean;
      restart?: boolean;
      failureEventPayload?: any;
    }>;
    getAuthEventPayload: () => Promise<any>;
    afterAuthReady: () => Promise<void>;
    disconnect: () => Promise<void>;
    destroy: () => Promise<void>;
    logout: () => Promise<void>;
  }

  /**
   * Local directory-based authentication
   */
  export class GLocalAuth extends AuthStrategy {
    public clientId?: string;
    public dataPath?: string;
    constructor(options?: { clientId?: string; dataPath?: string });
  }

  /** whatsapp web url */
  export const GcontcWebURL: string;

  /** default client options */
  export const DefaultOptions: ClientOptions;

  /** Events that can be emitted by the client */
  export enum Events {
    AUTHENTICATED = "authenticated",
    AUTHENTICATION_FAILURE = "auth_failure",
    READY = "ready",
    QR_RECEIVED = "qr",
    LOADING_SCREEN = "loading_screen",
    DISCONNECTED = "disconnected",
    STATE_CHANGED = "change_state",
  }

  /** GClient status */
  export enum Status {
    INITIALIZING = 0,
    AUTHENTICATING = 1,
    READY = 3,
  }

  /** WhatsApp state */
  export enum GCState {
    CONFLICT = "CONFLICT",
    CONNECTED = "CONNECTED",
    DEPRECATED_VERSION = "DEPRECATED_VERSION",
    OPENING = "OPENING",
    PAIRING = "PAIRING",
    PROXYBLOCK = "PROXYBLOCK",
    SMB_TOS_BLOCK = "SMB_TOS_BLOCK",
    TIMEOUT = "TIMEOUT",
    TOS_BLOCK = "TOS_BLOCK",
    UNLAUNCHED = "UNLAUNCHED",
    UNPAIRED = "UNPAIRED",
    UNPAIRED_IDLE = "UNPAIRED_IDLE",
  }
}

export = GCWebJS;
