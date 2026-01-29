"use client"

import { useState, useEffect } from "react"
import { apiCallWithData } from "@/lib/api-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { BlueprintIcon } from "@/components/ui/blueprint-icon"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "client"
  lastActive: string
}

export function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "client" as "admin" | "client",
    password: "",
  })

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await apiCallWithData<{ users: any[] }>('/api/users', {
        method: 'GET',
      })
      
      if (data.users) {
        // Transform the data to match the expected format
        const transformedUsers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastActive: user.last_login || user.created_at,
        }))
        setUsers(transformedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const data = await apiCallWithData<{ user: any }>('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      })
      if (data.user) {
        // Transform the user data to match expected format
        const newUserData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          lastActive: data.user.last_login || data.user.created_at,
        }
        
        setUsers([...users, newUserData])
        setNewUser({
          name: "",
          email: "",
          role: "client",
          password: "",
        })
        setIsAddDialogOpen(false)

        toast({
          title: "User added",
          description: `${newUser.name} has been added successfully.`,
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const data = await apiCallWithData<{ user: any }>(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      })
      if (data.user) {
        // Transform the user data to match expected format
        const updatedUserData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          lastActive: data.user.last_login || data.user.created_at,
        }
        
        setUsers(users.map((user) => (user.id === editingUser.id ? updatedUserData : user)))
        setIsEditDialogOpen(false)

        toast({
          title: "User updated",
          description: `${editingUser.name} has been updated successfully.`,
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await apiCallWithData(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been deleted successfully.`,
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <BlueprintIcon icon="plus" size={16} className="mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with specific permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: "admin" | "client") => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.lastActive).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={isEditDialogOpen && editingUser?.id === user.id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (open) setEditingUser(user)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <BlueprintIcon icon="edit" size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user details and permissions.</DialogDescription>
                          </DialogHeader>
                          {editingUser && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingUser.name}
                                  onChange={(e) =>
                                    setEditingUser({
                                      ...editingUser,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editingUser.email}
                                  onChange={(e) =>
                                    setEditingUser({
                                      ...editingUser,
                                      email: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                  value={editingUser.role}
                                  onValueChange={(value: "admin" | "client") =>
                                    setEditingUser({
                                      ...editingUser,
                                      role: value,
                                    })
                                  }
                                >
                                  <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleEditUser}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isDeleteDialogOpen && userToDelete?.id === user.id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (open) setUserToDelete(user)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <BlueprintIcon icon="trash" size={16} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {userToDelete && (
                            <div className="py-4">
                              <p>
                                You are about to delete <strong>{userToDelete.name}</strong> ({userToDelete.email}).
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteUser}>
                              Delete User
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
