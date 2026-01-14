import SahabatTaniMapNative from "./SahabatTaniMap.native";
import SahabatTaniMapWeb from "./SahabatTaniMap.web";

export default (SahabatTaniMapNative as any) || (SahabatTaniMapWeb as any);