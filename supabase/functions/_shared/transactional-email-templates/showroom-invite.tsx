import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

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
      <Container style={container}>
        <Text style={brand}>BILGEN</Text>
        <Heading style={heading}>Tack för din showroom-förfrågan</Heading>
        <Text style={paragraph}>
          Hej{contactName ? ` ${contactName}` : ''}
          {companyName ? ` på ${companyName}` : ''},
        </Text>
        <Text style={paragraph}>
          {message ||
            'Vi har tagit emot din förfrågan om ett eget showroom och återkommer med nästa steg.'}
        </Text>
        {selectedTemplate && (
          <Section style={infoBox}>
            <Text style={infoLabel}>Vald mall</Text>
            <Text style={infoValue}>{selectedTemplate}</Text>
          </Section>
        )}
        <Hr style={hr} />
        <Text style={footer}>BILGEN · bilgen.se</Text>
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
  backgroundColor: '#ffffff',
  fontFamily: 'Helvetica, Arial, sans-serif',
}

const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}

const brand = {
  fontSize: '14px',
  letterSpacing: '2px',
  fontWeight: 700,
  color: '#111827',
  margin: '0 0 24px',
}

const heading = {
  fontSize: '24px',
  lineHeight: '32px',
  color: '#111827',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px',
}

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '8px 0 16px',
}

const infoLabel = {
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: '#6b7280',
  margin: '0 0 4px',
}

const infoValue = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '28px 0 16px',
}

const footer = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
}
