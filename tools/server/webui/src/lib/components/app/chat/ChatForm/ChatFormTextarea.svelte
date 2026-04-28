<script lang="ts">
	import { autoResizeTextarea } from '$lib/utils';
	import { onMount } from 'svelte';

	interface Props {
		class?: string;
		disabled?: boolean;
		onInput?: () => void;
		onKeydown?: (event: KeyboardEvent) => void;
		onPaste?: (event: ClipboardEvent) => void;
		placeholder?: string;
		value?: string;
	}

	let {
		class: className = '',
		disabled = false,
		onInput,
		onKeydown,
		onPaste,
		placeholder = 'Ask anything...',
		value = $bindable('')
	}: Props = $props();

	let textareaElement: HTMLTextAreaElement | undefined;

	type UndoState = { value: string; selectionStart: number; selectionEnd: number };
	let undoStack: UndoState[] = [];
	let redoStack: UndoState[] = [];
	let isComposing = false;

	function getState(): UndoState {
		return {
			value,
			selectionStart: textareaElement?.selectionStart ?? 0,
			selectionEnd: textareaElement?.selectionEnd ?? 0
		};
	}

	function pushUndo() {
		undoStack.push(getState());
		if (undoStack.length > 1000) undoStack.shift();
		redoStack = [];
	}

	function restoreState(state: UndoState) {
		value = state.value;
		onInput?.();
		requestAnimationFrame(() => {
			if (textareaElement) {
				textareaElement.selectionStart = state.selectionStart;
				textareaElement.selectionEnd = state.selectionEnd;
				autoResizeTextarea(textareaElement);
			}
		});
	}

	function handleBeforeInput(event: InputEvent) {
		if (!textareaElement) return;

		if (event.inputType === 'historyUndo') {
			event.preventDefault();
			if (undoStack.length === 0) return;
			redoStack.push(getState());
			restoreState(undoStack.pop()!);
			return;
		}

		if (event.inputType === 'historyRedo') {
			event.preventDefault();
			if (redoStack.length === 0) return;
			undoStack.push(getState());
			restoreState(redoStack.pop()!);
			return;
		}

		if (event.inputType === 'insertCompositionText') {
			if (!isComposing) {
				isComposing = true;
				pushUndo();
			}
			return;
		}

		pushUndo();
	}

	function handleCompositionEnd() {
		isComposing = false;
	}

	onMount(() => {
		if (textareaElement) {
			autoResizeTextarea(textareaElement);
			textareaElement.focus();
		}
	});

	export function getElement() {
		return textareaElement;
	}

	export function focus() {
		textareaElement?.focus();
	}

	export function resetHeight() {
		if (textareaElement) {
			textareaElement.style.height = '1rem';
		}
	}

	export function clearHistory() {
		undoStack = [];
		redoStack = [];
	}
</script>

<div class="flex-1 {className}">
	<textarea
		bind:this={textareaElement}
		bind:value
		class="text-md min-h-12 w-full resize-none border-0 bg-transparent p-0 leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
		class:cursor-not-allowed={disabled}
		style="max-height: var(--max-message-height);"
		{disabled}
		onkeydown={onKeydown}
		onbeforeinput={handleBeforeInput}
		oncompositionend={handleCompositionEnd}
		oninput={(event) => {
			autoResizeTextarea(event.currentTarget);
			onInput?.();
		}}
		onpaste={onPaste}
		{placeholder}
	></textarea>
</div>
