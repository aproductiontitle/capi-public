// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://paosmzezteofsedmvhbr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb3NtemV6dGVvZnNlZG12aGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NTcxMjMsImV4cCI6MjA1MzIzMzEyM30.fZoekzW0u_0SIztif9JEawmynGgRezhf-DEIueo5D20";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);