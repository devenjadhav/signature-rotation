import { supabase } from './supabase';

export async function testDatabaseConnection() {
  try {
    // Test 1: Check if we can connect to Supabase
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw new Error(`Auth error: ${authError.message}`);
    if (!authData.session?.user) throw new Error('No authenticated user found');
    console.log('✅ Supabase connection successful');

    const userId = authData.session.user.id;
    console.log(`Testing with user ID: ${userId}`);

    // Test 2: Try to insert a test signature
    const testSignature = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: 'Test Signature',
      content: 'This is a test signature',
      active: false,
    };

    const { error: insertError } = await supabase
      .from('signatures')
      .insert(testSignature);

    if (insertError) {
      console.error('Insert error details:', insertError);
      throw new Error(`Insert error: ${insertError.message}`);
    }
    console.log('✅ Successfully inserted test signature');

    // Test 3: Try to read the test signature
    const { data: readData, error: readError } = await supabase
      .from('signatures')
      .select('*')
      .eq('id', testSignature.id)
      .single();

    if (readError) {
      console.error('Read error details:', readError);
      throw new Error(`Read error: ${readError.message}`);
    }
    console.log('✅ Successfully read test signature:', readData);

    // Test 4: Try to update the test signature
    const { error: updateError } = await supabase
      .from('signatures')
      .update({ name: 'Updated Test Signature' })
      .eq('id', testSignature.id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Update error details:', updateError);
      throw new Error(`Update error: ${updateError.message}`);
    }
    console.log('✅ Successfully updated test signature');

    // Test 5: Try to delete the test signature
    const { error: deleteError } = await supabase
      .from('signatures')
      .delete()
      .eq('id', testSignature.id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Delete error details:', deleteError);
      throw new Error(`Delete error: ${deleteError.message}`);
    }
    console.log('✅ Successfully deleted test signature');

    // Test 6: Try to insert test settings
    const testSettings = {
      user_id: userId,
      rotation_enabled: true,
      rotation_frequency: 'every_email',
      zapier_webhook_url: 'https://test.webhook.url',
      connected: false,
    };

    const { error: settingsError } = await supabase
      .from('settings')
      .upsert(testSettings);

    if (settingsError) {
      console.error('Settings error details:', settingsError);
      throw new Error(`Settings error: ${settingsError.message}`);
    }
    console.log('✅ Successfully inserted/updated test settings');

    // Test 7: Try to read the test settings
    const { data: settingsData, error: settingsReadError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsReadError) {
      console.error('Settings read error details:', settingsReadError);
      throw new Error(`Settings read error: ${settingsReadError.message}`);
    }
    console.log('✅ Successfully read test settings:', settingsData);

    return {
      success: true,
      message: 'All database tests passed successfully!',
    };
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return {
      success: false,
      message: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
} 