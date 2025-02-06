<script lang="ts">
    import { setResponse } from '@sveltejs/kit/node';
    import { display, nextQuestion, sendPrompt } from '../questions.svelte.js';
    import { onMount } from 'svelte';

    onMount(() => {
        nextQuestion();
    })

    let promptText: HTMLInputElement | undefined = $state();
    let promptInput = $state("");

    let promptButton: HTMLElement | undefined = $state();

    function scrollToEnd() {
        promptButton?.scrollIntoView({ behavior: 'smooth', block: 'end' });        
    }

    async function submitPrompt() {
        let s = promptInput;
        promptInput = "";       

        await sendPrompt(s, scrollToEnd);

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
    <div class="card p-4 shadow">
        <h1 id="heading" class="mb-3">Question</h1>
        <div id="question">
            {display.question}
        </div>
    </div>

    <div bind:this={aiText}>
        {#each display.chatDisplay as item}
            <br/>
            <br/>
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

    <div>
        <div class="mt-3">
            <input type="text" id="prompt-text" class="form-control" 
                onkeydown={onReturn}
                bind:this={promptText} 
                bind:value={promptInput} 
                placeholder="Prompt">
        </div>
        <button bind:this={promptButton} class="btn btn-primary mt-3" type="button" onclick={submitPrompt}>Submit</button>
        <button id="start-listen" class="btn btn-secondary mt-3" type="button">🎤 Start Listening</button>
        <button id="stop-listen" class="btn btn-danger mt-3" type="button" style="display: none;">Stop Listening</button>

        <button id="next-question" class="btn btn-success mt-3 float-end" type="button">Next Question</button>				
    </div>

</div>
