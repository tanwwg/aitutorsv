<script lang="ts">
    import { display, nextQuestion, sendPrompt, QuestionMode, selectQuestions } from '../questions.svelte.js';
    import { onMount } from 'svelte';
    import { initSpeech, speech, startListening, stopListening } from '../speech.svelte.js';

    let promptText: HTMLInputElement | undefined = $state();
    let promptInput = $state("");

    let scrollHere: HTMLElement | undefined = $state();

    onMount(() => {
        initSpeech((s) => {
            promptInput = s;            
        })
        selectQuestions("dsa");
    })

    function scrollToEnd() {
        scrollHere?.scrollIntoView({ behavior: 'smooth', block: 'end' });        
        // console.log(`scrollhere ${scrollHere}`);
    }

    // keeps everything in view
    $effect(() => {
        display.chatDisplay.length;
        scrollToEnd();
    });

    async function submitPrompt() {
        let s = promptInput;
        promptInput = "";       

        await sendPrompt(s);

        scrollToEnd();
        promptText?.focus();
    }

    let aiText: HTMLDivElement | undefined = $state();

    function onReturn(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            submitPrompt();
        }
    }

</script>

<div class="container mt-5">

    <ul class="nav nav-tabs">
        <li class="nav-item">
            <button class="nav-link" class:active={display.questionSet == 'dsa'}  onclick={(e) => selectQuestions("dsa")}>Data Structures</button>
        </li>
        <li class="nav-item">
            <button class="nav-link" class:active={display.questionSet == 'p6science'} onclick={(e) => selectQuestions("p6science")}>PSLE Science</button>            
        </li>
    </ul>

    <div class="card p-4 shadow">
        <h3 class="mb-3">Question {display.questionNum} / {display.totalQuestions}</h3>
        <div>
            {@html display.question}
        </div>
    </div>

    <div bind:this={aiText}>
        {#each display.chatDisplay as item}
            {#if item.role == "user"}
                <div class='card p-3 text-end' style='background-color: #f0f0f0;'>
                    <p>
                        {item.content}
                    </p>
                </div>
            {:else}                
                <div class='p-3'>
                    <p>
                        {item.content}
                    </p>
                </div>
            {/if}
        {/each}
    </div>

    {#if display.mode == QuestionMode.WaitingForPrompt}
        <div class="mt-3">
            <input type="text" id="prompt-text" class="form-control" 
                onkeydown={onReturn}
                bind:this={promptText} 
                bind:value={promptInput} 
                placeholder="Prompt">
        </div>
    {/if}

    <div>
        {#if display.mode != QuestionMode.Submitting}
            <button class="btn btn-primary mt-3" type="button" onclick={submitPrompt}>Submit</button>
            {#if speech.hasSpeech}
                {#if !speech.listening}
                    <button class="btn btn-secondary mt-3" type="button" onclick={startListening}>🎤 Start Listening</button>
                {:else}
                    <button class="btn btn-danger mt-3" type="button" onclick={stopListening}>Stop Listening</button>
                {/if}
            {/if}
            {#if display.hasNextQuestion}
                <button class="btn btn-success mt-3 float-end" type="button" onclick={nextQuestion}>Next Question</button>				
            {/if}
        {/if}
    </div>
                
    <div bind:this={scrollHere} class="m-3">

    </div>

</div>
