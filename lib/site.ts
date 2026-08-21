import { institutionConfig } from "../config/institution";
import { CORE_REPOSITORY_URL } from "./core";

export const PRODUCT_TITLE = institutionConfig.productName;
export const PRODUCT_DESCRIPTION = institutionConfig.aboutText;
export const CANONICAL_REPOSITORY_URL = CORE_REPOSITORY_URL;
export const CANONICAL_SITE_URL = institutionConfig.homepageUrl;
