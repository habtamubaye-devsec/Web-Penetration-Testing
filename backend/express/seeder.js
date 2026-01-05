const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ScanningTool = require('./models/ScanningTool');
const ScanMode = require('./models/ScanMode');
const connectDB = require('./config/DBconnect');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await ScanningTool.deleteMany();
        await ScanMode.deleteMany();

        const tools = [
            {
                name: 'Network Scanning',
                description: 'Port scanning and service discovery',
                type: 'network',
                isActive: true,
            },
            {
                name: 'SSL/TLS Analysis',
                description: 'Certificate verification and cipher suite checks',
                type: 'ssl',
                isActive: true,
            },
            {
                name: 'Firewall Detection',
                description: 'WAF fingerprinting and evasion testing',
                type: 'waf',
                isActive: true,
            },
            {
                name: 'HTTP Security',
                description: 'Security header analysis and misconfiguration checks',
                type: 'http',
                isActive: true,
            },
            {
                name: 'NSE Scripts',
                description: 'Run specialized Nmap scripts for deeper analysis',
                type: 'nse',
                isActive: true,
            },
        ];

        const modes = [
            {
                name: 'Basic Scan',
                description: 'Quick security assessment with minimal server load. Completes in 2-5 minutes.',
                estimatedTime: '2-5 minutes',
                scanType: 'fast',
                isActive: true,
            },
            {
                name: 'Full Scan',
                description: 'Comprehensive security testing including all vulnerability types. May take 10-20 minutes.',
                estimatedTime: '10-20 minutes',
                scanType: 'full',
                isActive: true,
            },
            {
                name: 'Custom Scan',
                description: 'Select specific test categories to include in your scan.',
                estimatedTime: 'Variable',
                scanType: 'custom',
                isActive: true,
            },
        ];

        await ScanningTool.insertMany(tools);
        await ScanMode.insertMany(modes);

        console.log('Database seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
