#!/usr/bin/env node

/**
 * @fileoverview Manual test script for the favorites metadata refresh API endpoint.
 *
 * Sends an authenticated POST request to /api/favorites/refresh-metadata using a
 * bearer token and prints the processing results, optimization statistics, and
 * any error details to the console.
 *
 * Usage:
 *   node scripts/test-metadata-refresh.js
 *
 * Environment variables:
 *   API_BASE_URL - Your application URL (default: http://localhost:3000)
 *   SECRET_BEARER - Your bearer token (default: from NEXT_PRIVATE_SECRET_BEARER)
 */

require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const SECRET_BEARER = process.env.SECRET_BEARER || process.env.NEXT_PRIVATE_SECRET_BEARER;

if (!SECRET_BEARER) {
    console.error('❌ Error: SECRET_BEARER or NEXT_PRIVATE_SECRET_BEARER environment variable is required');
    process.exit(1);
}

async function testMetadataRefresh() {
    const apiUrl = `${API_BASE_URL}/api/favorites/refresh-metadata`;
    
    console.log('🚀 Testing favorites metadata refresh...');
    console.log(`📍 API URL: ${apiUrl}`);
    console.log(`🔑 Using Bearer token: ${SECRET_BEARER.substring(0, 8)}...`);
    console.log('');

    try {
        console.log('⏳ Sending request...');
        const startTime = Date.now();

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SECRET_BEARER}`,
            },
            body: JSON.stringify({}),
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`⏱️  Request completed in ${duration}ms`);
        console.log(`📊 Response status: ${response.status} ${response.statusText}`);
        console.log('');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API call failed:');
            console.error(`Status: ${response.status}`);
            console.error(`Response: ${errorText}`);
            return;
        }

        const result = await response.json();
        
        console.log('✅ Metadata refresh completed successfully!');
        console.log('');
        console.log('📈 Results:');
        console.log(`   Total favorites found: ${result.total || 0}`);
        console.log(`   Successfully processed: ${result.processed || 0}`);
        console.log(`   Errors encountered: ${result.errors || 0}`);
        console.log(`   Message: ${result.message || 'No message'}`);

        if (result.optimization) {
            console.log('');
            console.log('⚡ Optimization Stats:');
            console.log(`   Unique stores processed: ${result.optimization.uniqueStores}`);
            console.log(`   Unique products processed: ${result.optimization.uniqueProducts}`);
            console.log(`   Database calls made: ${result.optimization.totalDatabaseCalls}`);
            console.log(`   Database calls saved: ${result.optimization.previousCalls - result.optimization.totalDatabaseCalls}`);
            console.log(`   Efficiency gain: ${Math.round((1 - result.optimization.totalDatabaseCalls / result.optimization.previousCalls) * 100)}%`);
        }

        if (result.errors > 0 && result.errorDetails) {
            console.log('');
            console.log('❗ Error details:');
            result.errorDetails.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        console.log('');
        console.log('🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed with error:');
        console.error(error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('💡 Suggestions:');
            console.log('   - Make sure your Next.js application is running');
            console.log('   - Check if the API_BASE_URL is correct');
            console.log('   - Verify the URL is accessible');
        }
    }
}

// Run the test
testMetadataRefresh(); 