"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function BorrowerLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to LMS</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Fast, transparent, and hassle-free loan applications. Get instant access to funds with our simple 4-step process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100">
              <Link href="/home">Go to Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/application">Apply Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-12 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Fast Process</h3>
              <p className="text-sm text-slate-500">
                Get approval in minutes with our streamlined application process.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Secure & Safe</h3>
              <p className="text-sm text-slate-500">
                Your data is encrypted and protected with industry standards.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Flexible Terms</h3>
              <p className="text-sm text-slate-500">
                Choose tenure and amount that fits your needs perfectly.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Competitive Rates</h3>
              <p className="text-sm text-slate-500">
                Lowest interest rates starting from 12% p.a. simple interest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Personal Details</h3>
              <p className="text-sm text-slate-500">
                Share your basic information and employment details.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Upload Documents</h3>
              <p className="text-sm text-slate-500">
                Upload your salary slip for instant verification.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Loan Configuration</h3>
              <p className="text-sm text-slate-500">
                Choose your loan amount and repayment tenure.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Get Approved</h3>
              <p className="text-sm text-slate-500">
                Our team reviews and approves your application quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Eligibility Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Age & Income</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Age between 23 - 50 years</li>
                <li>✓ Monthly salary ₹25,000 or more</li>
                <li>✓ Stable employment history</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Loan Details</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Loan amount: ₹50,000 - ₹5,00,000</li>
                <li>✓ Tenure: 30 - 365 days</li>
                <li>✓ Interest rate: 12% p.a. (Simple Interest)</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Documents Required</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Valid PAN number</li>
                <li>✓ Recent salary slip (PDF/JPG/PNG)</li>
                <li>✓ Current address proof</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Employment Types</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Salaried employees</li>
                <li>✓ Self-employed professionals</li>
                <li>✓ Business owners</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Your Loan?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Complete your application in just 4 easy steps and get approved instantly.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100">
            <Link href="/application">Start Application Now</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
