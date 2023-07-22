import { useSelector } from "react-redux";
import en from "../locales/en";
import { RootState } from "../store";

const languages:any = {
    en
}

export function useLanguage () {
    const lang:string = useSelector((state: RootState) => state.lang.lang);

    return {
        lang,
        text: languages[lang]
    }
}