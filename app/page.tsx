import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { AlertTriangle, Plus, Search } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-primary text-2xl">Personal Finance Manager</CardTitle>
              <CardDescription>shadcn/ui & Radix UI Component Primitives Verification</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">v1.0 MVP</Badge>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search merchant, payee, or notes..." className="pl-9" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-warning flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Dining Out Budget (85% Used)
                </span>
                <span className="text-muted-foreground font-mono">$425.00 / $500.00</span>
              </div>
              <Progress value={85} indicatorClassName="bg-warning" />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">Aug 07, 2026</TableCell>
                  <TableCell>
                    <Badge variant="expense">Expense</Badge>
                  </TableCell>
                  <TableCell>Groceries</TableCell>
                  <TableCell>Whole Foods Market</TableCell>
                  <TableCell className="text-right font-mono font-bold text-expense tabular-nums">
                    -$145.20
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">Aug 05, 2026</TableCell>
                  <TableCell>
                    <Badge variant="income">Income</Badge>
                  </TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>TechCorp Payroll</TableCell>
                  <TableCell className="text-right font-mono font-bold text-income tabular-nums">
                    +$2,700.00
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
