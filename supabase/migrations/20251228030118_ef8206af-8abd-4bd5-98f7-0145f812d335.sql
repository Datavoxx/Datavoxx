-- Owner kan lägga till email-credentials för alla användare
CREATE POLICY "Owner can insert email_credentials"
ON public.email_credentials FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner'));

-- Owner kan uppdatera email-credentials
CREATE POLICY "Owner can update email_credentials"
ON public.email_credentials FOR UPDATE
USING (has_role(auth.uid(), 'owner'));

-- Owner kan ta bort email-credentials
CREATE POLICY "Owner can delete email_credentials"
ON public.email_credentials FOR DELETE
USING (has_role(auth.uid(), 'owner'));