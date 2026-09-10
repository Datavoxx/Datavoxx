import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const LOGO_URL =
  'https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/templates/brand%2Fbilgen-logo.png'

interface Props {
  companyName?: string
  contactName?: string
  selectedTemplate?: string
  message?: string
}

const ShowroomInviteEmail = ({
  companyName,
  contactName,
  selectedTemplate,
  message,
}: Props) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Din showroom-förfrågan hos BILGEN</Preview>
    <Body style={main}>
      <Container style={outer}>
        <Section style={logoRow}>
          <Img src={LOGO_URL} alt="BILGEN" width="118" style={logo} />
        </Section>

        <Section style={card}>
          <Text style={eyebrow}>SHOWROOM</Text>
          <Heading style={heading}>Tack för din showroom-förfrågan</Heading>

          <Text style={paragraph}>
            Hej{contactName ? ` ${contactName}` : ''}
            {companyName ? ` på ${companyName}` : ''},
          </Text>

          <Text style={paragraph}>
            {message ||
              'Vi har tagit emot er förfrågan om ett eget showroom. Vi bygger en sida som visar er bilhall med er egen profil – logotyp, färger och kontaktuppgifter – och som ni enkelt kan dela med kunder.'}
          </Text>

          {selectedTemplate && (
            <Section style={infoBox}>
              <Text style={infoLabel}>VALD MALL</Text>
              <Text style={infoValue}>{selectedTemplate}</Text>
            </Section>
          )}

          <Text style={paragraph}>
            Nästa steg: vi tar fram ett förslag åt er och återkommer med en
            förhandsvisning. Svara gärna på det här mejlet om ni vill lägga till
            något innan dess.
          </Text>

          <Section style={buttonRow}>
            <Button style={button} href="https://bilgen.se">
              Se BILGEN
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={signature}>
            Vänliga hälsningar
            <br />
            <strong style={strong}>Teamet på BILGEN</strong>
          </Text>
          <Text style={contact}>
            <Link href="mailto:showroom@bilgen.se" style={link}>
              showroom@bilgen.se
            </Link>
            {' · '}
            <Link href="https://bilgen.se" style={link}>
              bilgen.se
            </Link>
          </Text>
        </Section>

        <Text style={footer}>
          BILGEN – verktyg för bilhandlare: annonstexter, bilder, e-post och
          research.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ShowroomInviteEmail,
  subject: 'Din showroom-förfrågan hos BILGEN',
  displayName: 'Showroom-förfrågan',
  previewData: {
    companyName: 'TH Trading',
    contactName: 'Kontaktperson',
    selectedTemplate: 'Showroom 1',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#f4f5f7',
  fontFamily:
    "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  padding: '32px 0',
}

const outer = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0 16px',
}

const logoRow = {
  padding: '0 0 20px',
  textAlign: 'center' as const,
}

const logo = {
  display: 'block',
  margin: '0 auto',
}

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e8e9ec',
  padding: '36px 32px',
}

const eyebrow = {
  fontSize: '11px',
  letterSpacing: '2px',
  fontWeight: 600,
  color: '#8a8f98',
  margin: '0 0 10px',
}

const heading = {
  fontSize: '26px',
  lineHeight: '34px',
  fontWeight: 600,
  color: '#0a0a0a',
  margin: '0 0 20px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '27px',
  color: '#3a3d42',
  margin: '0 0 16px',
}

const infoBox = {
  backgroundColor: '#f7f8fa',
  border: '1px solid #ececf0',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '4px 0 20px',
}

const infoLabel = {
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: '#8a8f98',
  margin: '0 0 4px',
}

const infoValue = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#0a0a0a',
  margin: '0',
}

const buttonRow = {
  padding: '8px 0 4px',
}

const button = {
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '10px',
  padding: '13px 26px',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = {
  borderColor: '#ececf0',
  margin: '28px 0 20px',
}

const signature = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#3a3d42',
  margin: '0 0 8px',
}

const strong = {
  color: '#0a0a0a',
}

const contact = {
  fontSize: '14px',
  color: '#8a8f98',
  margin: '0',
}

const link = {
  color: '#0a0a0a',
  textDecoration: 'underline',
}

const footer = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#9aa0a6',
  textAlign: 'center' as const,
  margin: '20px 0 0',
}
