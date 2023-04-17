import Cookies from "universal-cookie";
import userText from '../user-text.json'

const cookies = new Cookies();

export function getText(phraseId, preferredLang=cookies.get('preferredLang') || 'en') {
    var phraseIndex = userText.phrases.findIndex(phrase => phrase.id === phraseId)
    if(phraseIndex >= 0){
        return userText.phrases[phraseIndex][preferredLang]
    } else {
        return phraseId
    }
    
}