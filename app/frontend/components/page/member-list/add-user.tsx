"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

export function AddUserContent() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogDescription>
          Enter the details for the new member.
        </DialogDescription>
      </DialogHeader>
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <Label htmlFor="slotSponsorUsername">
                  Slot Sponsor Username
                </Label>
                <Input
                  id="slotSponsorUsername"
                  placeholder="Enter Sponsor Username"
                />
              </Field>
              <Field>
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter Username" />
              </Field>
              <Field>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="Enter Email Address" />
              </Field>
              <FieldGroup className="grid grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="firstName">
                    First Name
                  </FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="Enter First Name"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="mid">Middle Name</FieldLabel>
                  <Input id="mid" placeholder="Enter Middle Name" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input id="lastName" placeholder="Enter Last Name" />
                </Field>
              </FieldGroup>

              <Field>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="+63 (123) 123-4567"
                />
              </Field>

              <Field>
                <Label htmlFor="countryCurrency">
                  Country / Currency
                </Label>
                <Select>
                  <SelectTrigger id="countryCurrency">
                    <SelectValue placeholder="countryCurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="philippines">
                      Philippines
                    </SelectItem>
                    <SelectItem value="japan">Japan</SelectItem>
                    <SelectItem value="usa">USA</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
        <Button>Submit</Button>
      </DialogFooter>
    </>
  );
}
