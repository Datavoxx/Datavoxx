import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailMessage {
  id: string;
  uid: number;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
  isRead: boolean;
}

class ImapClient {
  private conn: Deno.TlsConn | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private buffer = "";
  private tagCounter = 0;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  async connect(host: string, port: number): Promise<void> {
    this.conn = await Deno.connectTls({ hostname: host, port });
    this.reader = this.conn.readable.getReader();
    // Read greeting
    await this.readResponse();
  }

  private async readLine(): Promise<string> {
    while (!this.buffer.includes("\r\n")) {
      const { value, done } = await this.reader!.read();
      if (done) throw new Error("Connection closed");
      this.buffer += this.decoder.decode(value);
    }
    const idx = this.buffer.indexOf("\r\n");
    const line = this.buffer.substring(0, idx);
    this.buffer = this.buffer.substring(idx + 2);
    return line;
  }

  private async readResponse(): Promise<string[]> {
    const lines: string[] = [];
    while (true) {
      const line = await this.readLine();
      lines.push(line);
      // Check if this is a tagged response or untagged end
      if (line.match(/^(A\d+|\*) (OK|NO|BAD)/)) {
        break;
      }
    }
    return lines;
  }

  private async command(cmd: string): Promise<string[]> {
    const tag = `A${++this.tagCounter}`;
    const fullCmd = `${tag} ${cmd}\r\n`;
    await this.conn!.write(this.encoder.encode(fullCmd));
    
    const lines: string[] = [];
    while (true) {
      const line = await this.readLine();
      lines.push(line);
      if (line.startsWith(`${tag} `)) break;
    }
    return lines;
  }

  async login(user: string, pass: string): Promise<void> {
    const resp = await this.command(`LOGIN "${user}" "${pass}"`);
    const lastLine = resp[resp.length - 1];
    if (!lastLine.includes("OK")) {
      throw new Error("AUTHENTICATIONFAILED");
    }
  }

  async select(mailbox: string): Promise<number> {
    const resp = await this.command(`SELECT "${mailbox}"`);
    let exists = 0;
    for (const line of resp) {
      const match = line.match(/\* (\d+) EXISTS/);
      if (match) exists = parseInt(match[1]);
    }
    return exists;
  }

  async fetchHeaders(seqStart: number, seqEnd: number): Promise<EmailMessage[]> {
    const emails: EmailMessage[] = [];
    const resp = await this.command(
      `FETCH ${seqStart}:${seqEnd} (UID FLAGS BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)] BODY.PEEK[TEXT])`
    );

    let currentEmail: Partial<EmailMessage> | null = null;
    let collectingHeaders = false;
    let collectingBody = false;
    let headerBuffer = "";
    let bodyBuffer = "";
    let currentUid = 0;
    let isRead = false;

    for (const line of resp) {
      // Start of new message
      const fetchMatch = line.match(/^\* (\d+) FETCH/);
      if (fetchMatch) {
        // Save previous email if exists
        if (currentEmail && currentEmail.uid) {
          currentEmail.body = cleanBody(bodyBuffer.trim());
          currentEmail.preview = currentEmail.body.substring(0, 150).replace(/\s+/g, " ").trim();
          if (currentEmail.body.length > 150) currentEmail.preview += "...";
          emails.push(currentEmail as EmailMessage);
        }
        
        currentEmail = { id: "", uid: 0, from: "", fromName: "", subject: "", date: "", preview: "", body: "", isRead: false };
        headerBuffer = "";
        bodyBuffer = "";
        collectingHeaders = false;
        collectingBody = false;
        
        // Parse UID
        const uidMatch = line.match(/UID (\d+)/);
        if (uidMatch) {
          currentUid = parseInt(uidMatch[1]);
          currentEmail.uid = currentUid;
          currentEmail.id = currentUid.toString();
        }
        
        // Check flags
        isRead = line.includes("\\Seen");
        currentEmail.isRead = isRead;
        
        // Check for header start
        if (line.includes("BODY[HEADER")) {
          collectingHeaders = true;
        }
        continue;
      }

      if (!currentEmail) continue;

      // Parse headers
      if (collectingHeaders) {
        if (line === "" || line === ")") {
          collectingHeaders = false;
          // Parse collected headers
          const fromMatch = headerBuffer.match(/^From:\s*(.+)$/im);
          if (fromMatch) {
            const fromRaw = fromMatch[1].trim();
            const nameMatch = fromRaw.match(/^"?([^"<]+)"?\s*<([^>]+)>/);
            if (nameMatch) {
              currentEmail.fromName = nameMatch[1].trim();
              currentEmail.from = nameMatch[2].trim();
            } else {
              currentEmail.from = fromRaw;
              currentEmail.fromName = fromRaw.split("@")[0];
            }
          }
          
          const subjectMatch = headerBuffer.match(/^Subject:\s*(.+)$/im);
          if (subjectMatch) {
            currentEmail.subject = decodeHeader(subjectMatch[1].trim());
          } else {
            currentEmail.subject = "(Inget ämne)";
          }
          
          const dateMatch = headerBuffer.match(/^Date:\s*(.+)$/im);
          if (dateMatch) {
            try {
              currentEmail.date = new Date(dateMatch[1].trim()).toISOString();
            } catch {
              currentEmail.date = new Date().toISOString();
            }
          } else {
            currentEmail.date = new Date().toISOString();
          }
        } else {
          headerBuffer += line + "\n";
        }
        continue;
      }

      // Check for body start
      if (line.includes("BODY[TEXT]")) {
        collectingBody = true;
        continue;
      }

      // Collect body
      if (collectingBody) {
        if (line === ")" || line.endsWith(")")) {
          collectingBody = false;
        } else {
          bodyBuffer += line + "\n";
        }
      }
    }

    // Save last email
    if (currentEmail && currentEmail.uid) {
      currentEmail.body = cleanBody(bodyBuffer.trim());
      currentEmail.preview = currentEmail.body.substring(0, 150).replace(/\s+/g, " ").trim();
      if (currentEmail.body.length > 150) currentEmail.preview += "...";
      emails.push(currentEmail as EmailMessage);
    }

    return emails;
  }

  async logout(): Promise<void> {
    try {
      await this.command("LOGOUT");
    } catch {}
    try {
      this.conn?.close();
    } catch {}
  }
}

function decodeUtf8(str: string): string {
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return str;
  }
}

function decodeHeader(header: string): string {
  // Decode RFC 2047 encoded words (handles =?charset?encoding?text?= format)
  let decoded = header.replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi, (_, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === "B") {
        // Base64 decoding
        const decoded = atob(text);
        return decodeUtf8(decoded);
      } else if (encoding.toUpperCase() === "Q") {
        // Quoted-printable decoding
        const qpDecoded = text
          .replace(/_/g, " ")
          .replace(/=([0-9A-F]{2})/gi, (_match: string, hex: string) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        return decodeUtf8(qpDecoded);
      }
    } catch {}
    return text;
  });
  
  // Clean up any remaining whitespace issues from multi-line encoded headers
  decoded = decoded.replace(/\s+/g, ' ').trim();
  
  return decoded;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanBody(body: string): string {
  let text = body;
  
  // Check if this is a multipart MIME message
  const boundaryMatch = body.match(/boundary="?([^"\s\r\n]+)"?/i);
  
  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const parts = body.split(new RegExp(`--${escapeRegex(boundary)}`));
    
    // Find the text/plain part first, then text/html as fallback
    let plainText = '';
    let htmlText = '';
    
    for (const part of parts) {
      if (part.toLowerCase().includes('content-type: text/plain')) {
        // Extract content after the headers (double newline)
        const contentMatch = part.match(/\r?\n\r?\n([\s\S]*)/);
        if (contentMatch) {
          plainText = contentMatch[1];
          break;
        }
      } else if (part.toLowerCase().includes('content-type: text/html')) {
        const contentMatch = part.match(/\r?\n\r?\n([\s\S]*)/);
        if (contentMatch) {
          htmlText = contentMatch[1];
        }
      }
    }
    
    text = plainText || htmlText || text;
  }
  
  // Remove common MIME messages
  text = text.replace(/^This is a multipart message in MIME format\.?\s*/gim, '');
  
  // Remove MIME headers that might still be in the text
  text = text.replace(/^Content-Type:.*$/gim, '');
  text = text.replace(/^Content-Transfer-Encoding:.*$/gim, '');
  text = text.replace(/^Content-Disposition:.*$/gim, '');
  
  // Remove boundary markers - multiple patterns to catch all variations
  text = text.replace(/^--[-=\w]+--?$/gm, '');  // Standard boundary format
  text = text.replace(/^-{2,}[\w-]*-{0,2}$/gm, '');  // More aggressive boundary lines
  text = text.replace(/-{5,}\d[\d-]*/g, '');  // Inline boundaries like -----------9072-1766368286425-1
  text = text.replace(/-{10,}[\d-]+/g, '');  // Very long dash sequences with numbers
  
  // Decode quoted-printable
  text = text.replace(/=\r?\n/g, ''); // Remove soft line breaks
  text = text.replace(/=([0-9A-F]{2})/gi, (_, hex) => {
    const charCode = parseInt(hex, 16);
    return String.fromCharCode(charCode);
  });
  
  // Fix UTF-8 encoding issues (Ã¤ → ä, etc)
  try {
    // Try to decode as UTF-8 bytes
    const bytes = new Uint8Array(text.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (!decoded.includes('�')) {
      text = decoded;
    }
  } catch {}
  
  // Remove HTML tags if present
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)));
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const imapHost = Deno.env.get("IMAP_HOST");
  const imapUser = Deno.env.get("IMAP_USER");
  const imapPass = Deno.env.get("IMAP_PASS");

  if (!imapHost || !imapUser || !imapPass) {
    console.error("Missing IMAP credentials");
    return new Response(
      JSON.stringify({ error: "IMAP-konfiguration saknas. Kontakta administratören." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const client = new ImapClient();

  try {
    const { limit = 20 } = await req.json().catch(() => ({}));

    console.log(`Connecting to IMAP server: ${imapHost} as ${imapUser}`);
    await client.connect(imapHost, 993);
    console.log("Connected, logging in...");
    
    await client.login(imapUser, imapPass);
    console.log("Logged in, selecting INBOX...");
    
    const totalMessages = await client.select("INBOX");
    console.log(`INBOX has ${totalMessages} messages`);

    if (totalMessages === 0) {
      await client.logout();
      return new Response(JSON.stringify({ emails: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startSeq = Math.max(1, totalMessages - limit + 1);
    console.log(`Fetching messages ${startSeq} to ${totalMessages}`);
    
    const emails = await client.fetchHeaders(startSeq, totalMessages);
    
    // Sort by date descending
    emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await client.logout();
    console.log(`Successfully fetched ${emails.length} emails`);

    return new Response(JSON.stringify({ emails }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("IMAP Error:", error);
    
    await client.logout();

    let errorMessage = "Kunde inte ansluta till e-postservern.";
    if (error instanceof Error) {
      if (error.message.includes("AUTHENTICATIONFAILED")) {
        errorMessage = "Fel användarnamn eller lösenord för e-postkontot.";
      } else if (error.message.includes("ENOTFOUND") || error.message.includes("ETIMEDOUT")) {
        errorMessage = "Kunde inte nå e-postservern. Kontrollera IMAP_HOST.";
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
