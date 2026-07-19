import { AttachmentBuilder } from 'discord.js';

export const generateTranscript = async (channel) => {
  const messages = [];
  let lastId = null;

  try {
    for (let i = 0; i < 10; i++) {
      const fetched = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) });
      if (fetched.size === 0) break;
      messages.push(...fetched.values());
      lastId = fetched.last().id;
    }
  } catch (err) {
    console.error('Failed to fetch messages for transcript:', err.message);
  }

  const sorted = messages.reverse();
  const lines = sorted.map(m => {
    const time = m.createdAt.toISOString();
    const author = m.author.tag;
    const content = m.content || '(no text content)';
    const attachments = m.attachments.size > 0 ? ` [${m.attachments.map(a => a.url).join(', ')}]` : '';
    return `[${time}] ${author}: ${content}${attachments}`;
  });

  const transcriptContent = [
    `Ticket Transcript — ${channel.name}`,
    `Server: ${channel.guild.name}`,
    `Date: ${new Date().toISOString()}`,
    `${'='.repeat(50)}`,
    ...lines,
  ].join('\n');

  return new AttachmentBuilder(Buffer.from(transcriptContent, 'utf-8'), { name: `transcript-${channel.name}.txt` });
};
