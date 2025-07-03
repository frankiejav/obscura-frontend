"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Search } from "lucide-react"
import { executeGraphQLQuery } from "@/lib/graphql-client"

type SearchResult = {
  id: string
  name?: string
  email?: string
  ip?: string
  domain?: string
  source?: string
  timestamp: string
}

export function SearchInterface() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsLoading(true)
    try {
      const query = `
        query SearchData($term: String!, $type: String!, $page: Int!, $limit: Int!) {
          search(term: $term, type: $type, page: $page, limit: $limit) {
            results {
              id
              name
              email
              ip
              domain
              source
              timestamp
            }
            pagination {
              total
              pages
              current
            }
          }
        }
      `

      const response = await executeGraphQLQuery(query, {
        term: searchTerm,
        type: searchType,
        page: page,
        limit: 10,
      })

      setResults(response.data.search.results)
      setTotalPages(response.data.search.pagination.pages)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for demonstration
  const mockSearch = () => {
    setIsLoading(true)
    setTimeout(() => {
      const mockResults: SearchResult[] = Array.from({ length: 10 }, (_, i) => ({
        id: `result-${i + 1}`,
        name: searchType === "all" || searchType === "name" ? `User ${i + 1}` : undefined,
        email: searchType === "all" || searchType === "email" ? `user${i + 1}@example.com` : undefined,
        ip: searchType === "all" || searchType === "ip" ? `192.168.1.${i + 1}` : undefined,
        domain: searchType === "all" || searchType === "domain" ? `example${i + 1}.com` : undefined,
        source: `Source ${Math.floor(Math.random() * 5) + 1}`,
        timestamp: new Date().toISOString(),
      }))
      setResults(mockResults)
      setTotalPages(5)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Data</CardTitle>
          <CardDescription>Search for data by name, email, IP, domain, or source</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mockSearch()
            }}
            className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
          >
            <div className="flex-1">
              <Input
                placeholder="Enter search term..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue placeholder="Search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="source">Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || !searchTerm.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {results.length} results for &quot;{searchTerm}&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {(searchType === "all" || searchType === "name") && <TableHead>Name</TableHead>}
                    {(searchType === "all" || searchType === "email") && <TableHead>Email</TableHead>}
                    {(searchType === "all" || searchType === "ip") && <TableHead>IP Address</TableHead>}
                    {(searchType === "all" || searchType === "domain") && <TableHead>Domain</TableHead>}
                    <TableHead>Source</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      {(searchType === "all" || searchType === "name") && <TableCell>{result.name || "—"}</TableCell>}
                      {(searchType === "all" || searchType === "email") && <TableCell>{result.email || "—"}</TableCell>}
                      {(searchType === "all" || searchType === "ip") && <TableCell>{result.ip || "—"}</TableCell>}
                      {(searchType === "all" || searchType === "domain") && (
                        <TableCell>{result.domain || "—"}</TableCell>
                      )}
                      <TableCell>{result.source}</TableCell>
                      <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) {
                        setPage(page - 1)
                        mockSearch()
                      }
                    }}
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(i + 1)
                        mockSearch()
                      }}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) {
                        setPage(page + 1)
                        mockSearch()
                      }
                    }}
                    aria-disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
