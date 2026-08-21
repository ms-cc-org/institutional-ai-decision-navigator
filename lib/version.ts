import packageJson from "../package.json";
import { institutionConfig } from "../config/institution";
import { ontology } from "./ontology";

export const versionInfo = {
  application: packageJson.version,
  coreOntology: ontology.version,
  localConfig: institutionConfig.configVersion,
} as const;
