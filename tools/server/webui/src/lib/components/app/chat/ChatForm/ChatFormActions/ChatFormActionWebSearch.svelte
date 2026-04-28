<script lang="ts">
	import { Globe } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { conversationsStore } from '$lib/stores/conversations.svelte';
	import { mcpStore } from '$lib/stores/mcp.svelte';
	import { MCP_WEB_SEARCH_SERVER_ID } from '$lib/constants/mcp';

	interface Props {
		class?: string;
		disabled?: boolean;
	}

	let { class: className = '', disabled = false }: Props = $props();

	let webSearchServer = $derived(
		mcpStore.getServers().find((s) => s.id === MCP_WEB_SEARCH_SERVER_ID && s.enabled)
	);
	let isEnabled = $derived(
		webSearchServer
			? conversationsStore.isMcpServerEnabledForChat(MCP_WEB_SEARCH_SERVER_ID)
			: false
	);

	async function toggle() {
		await conversationsStore.toggleMcpServerForChat(MCP_WEB_SEARCH_SERVER_ID);
	}
</script>

{#if webSearchServer}
	<Tooltip.Root>
		<Tooltip.Trigger class="w-full">
			<Button
				class="h-8 gap-1.5 rounded-full px-3 {className}"
				{disabled}
				variant={isEnabled ? 'default' : 'secondary'}
				type="button"
				onclick={toggle}
			>
				<Globe class="h-4 w-4" />
				<span class="text-xs">Web Search</span>
			</Button>
		</Tooltip.Trigger>

		<Tooltip.Content>
			<p>{isEnabled ? 'Disable web search' : 'Enable web search'}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
