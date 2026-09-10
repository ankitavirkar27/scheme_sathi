import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

const EXAMPLE_SCHEMES = [
  {
    id: "pmmy-sl",
    name: "Pradhan Mantri Mudra Yojana - Shishu Loan",
    description: "Government guarantee scheme for small businesses without collateral, covering micro-enterprises.",
    ministry: "Ministry of Finance",
    category: "Micro Finance",
    targetBeneficiaries: "Micro-entrepreneurs, street vendors, small businesses",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Retail", "Services", "Manufacturing", "Dairy", "Textiles"],
    maximumLoanAmount: 500000,
    minimumLoanAmount: 50000,
    minIncome: 0,
    maxIncome: 1500000,
    minAge: 18,
    maxAge: 65,
    interestRate: "8-10",
    processingTime: "5-7 days",
    documents: ["Aadhar", "PAN", "Bank Statement", "Business Plan"],
  },
  {
    id: "pmmy-kishan",
    name: "Pradhan Mantri Mudra Yojana - Kishor Loan",
    description: "Business loans for entrepreneurs working on established businesses with growth potential.",
    ministry: "Ministry of Finance",
    category: "Business Expansion",
    targetBeneficiaries: "Small business owners, entrepreneurs",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Retail", "Services", "Manufacturing", "Dairy", "Textiles"],
    maximumLoanAmount: 1000000,
    minimumLoanAmount: 500000,
    minIncome: 100000,
    maxIncome: 5000000,
    minAge: 21,
    maxAge: 65,
    interestRate: "7-9",
    processingTime: "10-15 days",
    documents: ["Aadhar", "PAN", "ITR", "Bank Statement", "Business Proof"],
  },
  {
    id: "subsidy-manufacturing",
    name: "Manufacturing Subsidy Scheme",
    description: "Direct subsidies for manufacturing units to boost industrial development and employment.",
    ministry: "Ministry of Industries",
    category: "Manufacturing",
    targetBeneficiaries: "Manufacturing startups, industrial units",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Manufacturing", "Textiles"],
    maximumLoanAmount: 2500000,
    minimumLoanAmount: 1000000,
    minIncome: 200000,
    maxIncome: 10000000,
    minAge: 18,
    maxAge: 65,
    interestRate: "4-6",
    processingTime: "30-45 days",
    documents: ["Aadhar", "PAN", "ITR", "Manufacturing License", "Project Report"],
  },
  {
    id: "agri-gold",
    name: "Agriculture Gold Loan Scheme",
    description: "Low-interest loans for farmers using agricultural gold holdings as security.",
    ministry: "Ministry of Agriculture",
    category: "Agriculture",
    targetBeneficiaries: "Farmers, agricultural entrepreneurs",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Dairy", "Agriculture", "Agribusiness"],
    maximumLoanAmount: 750000,
    minimumLoanAmount: 100000,
    minIncome: 50000,
    maxIncome: 2000000,
    minAge: 18,
    maxAge: 70,
    interestRate: "6-8",
    processingTime: "7-10 days",
    documents: ["Aadhar", "PAN", "Land Documents", "Gold Valuation Certificate"],
  },
  {
    id: "st-export",
    name: "Star Trade Export Promotion Scheme",
    description: "Export incentives and financial support for exporters to promote international trade.",
    ministry: "Ministry of Commerce",
    category: "Export",
    targetBeneficiaries: "Export-oriented entrepreneurs, trading companies",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Textiles", "Manufacturing", "Services", "Retail"],
    maximumLoanAmount: 5000000,
    minimumLoanAmount: 1000000,
    minIncome: 500000,
    maxIncome: 25000000,
    minAge: 25,
    maxAge: 65,
    interestRate: "3-5",
    processingTime: "20-30 days",
    documents: ["Aadhar", "PAN", "ITR", "Export License", "Business Registration"],
  },
  {
    id: "women-startup",
    name: "Women Entrepreneurship Empowerment Scheme",
    description: "Special scheme with concessions for women entrepreneurs to start or expand businesses.",
    ministry: "Ministry of Women and Child Development",
    category: "Women Empowerment",
    targetBeneficiaries: "Women entrepreneurs, self-help groups",
    active: true,
    eligibleCategories: ["Women (All Categories)"],
    eligibleStates: ["All India"],
    projectTypes: ["Retail", "Services", "Manufacturing", "Textiles", "Dairy"],
    maximumLoanAmount: 1500000,
    minimumLoanAmount: 100000,
    minIncome: 0,
    maxIncome: 3000000,
    minAge: 18,
    maxAge: 65,
    interestRate: "6-8",
    processingTime: "15-20 days",
    documents: ["Aadhar", "PAN", "Bank Statement", "Business Plan", "Gender Certificate"],
  },
  {
    id: "ed-startup",
    name: "National Startup Fund for Education Sector",
    description: "Funding for EdTech startups and educational technology innovation companies.",
    ministry: "Ministry of Education",
    category: "Technology",
    targetBeneficiaries: "EdTech entrepreneurs, educational innovators",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Services", "Technology"],
    maximumLoanAmount: 2000000,
    minimumLoanAmount: 500000,
    minIncome: 100000,
    maxIncome: 5000000,
    minAge: 18,
    maxAge: 65,
    interestRate: "5-7",
    processingTime: "25-35 days",
    documents: ["Aadhar", "PAN", "ITR", "Business Registration", "Technology Plan"],
  },
  {
    id: "retail-boost",
    name: "Retail Business Modernization Scheme",
    description: "Support for modernizing retail businesses with technology and infrastructure upgrades.",
    ministry: "Ministry of Commerce",
    category: "Retail",
    targetBeneficiaries: "Retail business owners, shop owners",
    active: true,
    eligibleCategories: ["General", "SC", "ST", "OBC"],
    eligibleStates: ["All India"],
    projectTypes: ["Retail", "Services"],
    maximumLoanAmount: 1200000,
    minimumLoanAmount: 300000,
    minIncome: 100000,
    maxIncome: 4000000,
    minAge: 21,
    maxAge: 60,
    interestRate: "7-9",
    processingTime: "12-18 days",
    documents: ["Aadhar", "PAN", "Shop Registration", "Lease Agreement", "Business Plan"],
  },
];

export async function seedSchemes() {
  try {
    console.log("🌱 Starting scheme seeding...");

    // Check if schemes already exist
    const existingSchemes = await getDocs(
      query(collection(db, "schemes"), where("active", "==", true))
    );

    if (existingSchemes.docs.length > 0) {
      console.warn("⚠️ Schemes already exist in database. Skipping seed.");
      console.log(`Found ${existingSchemes.docs.length} active schemes.`);
      return;
    }

    // Add all schemes to Firestore
    const schemesCollection = collection(db, "schemes");
    let addedCount = 0;

    for (const scheme of EXAMPLE_SCHEMES) {
      await setDoc(doc(schemesCollection, scheme.id), scheme);
      addedCount++;
      console.log(`✅ Added scheme: ${scheme.name}`);
    }

    console.log(`✨ Successfully seeded ${addedCount} example schemes!`);
    return { success: true, count: addedCount };
  } catch (error) {
    console.error("❌ Error seeding schemes:", error);
    throw error;
  }
}

export default seedSchemes;
