
export const speech = $state({
    listening: false,
    hasSpeech: false
});

var recognition: any | null = null;

export function initSpeech(callback: (text: string) => void) {
    if (recognition != null) return;

    const hasSpeech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log(`initSpeech ${hasSpeech}`);
    if (!hasSpeech) return;

    recognition = new hasSpeech();
    recognition.continuous = true; 
    recognition.lang = 'en-US'; 
    recognition.interimResults = true;  // Only final results    

    recognition.onresult = (event: any) => {
        // const transcript = event.results[0][0].transcript;
        let fullText = Array.from(event.results) // Convert results to an array
            .map((result: any) => result[0].transcript) // Extract the transcript
            .join(" ");
        callback(fullText);
        // console.dir(event.results);
        // inputElement.value = fullText;
        // document.getElementById("output").textContent = transcript;
    };
    recognition.onerror = (event: any) => {
        console.error("Error occurred in recognition:", event.error);
    };    

    speech.hasSpeech = true;
}

export function startListening() {
    speech.listening = true;
    recognition.start();

}

export function stopListening() {
    speech.listening = false;
    recognition.stop();
}