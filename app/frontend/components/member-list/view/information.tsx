"use client";

import {
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface InformationContentProps {
    selectedUser: any;
  frameworks: string[];
}

export function InformationContent({ selectedUser, frameworks  }: InformationContentProps) {
    console.log(selectedUser);
  return (
    <form>
      <div className="text-center py-5">
        <DialogTitle>Slot Information</DialogTitle>
      </div>
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-3">
            <Field>
              <FieldLabel htmlFor="username">
                Username
              </FieldLabel>
              <Input
                id="username"
                placeholder="Enter Username"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="slotOwner">
                Slot Owner
              </FieldLabel>
              <Input
                id="slotOwner"
                placeholder="Administrator"
                disabled
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="sponsor">Sponsor</FieldLabel>
              <Input id="sponsor" placeholder="--" disabled />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-3">
            <Field>
              <FieldLabel htmlFor="membershipPackage">
                Membership Package
              </FieldLabel>
              <Combobox items={frameworks}>
                <ComboboxInput placeholder="Membership Package" />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel htmlFor="slotOwner">
                Slot Owner
              </FieldLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">
                    Blocked
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="emailStatus">
                Email Status
              </FieldLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activated">
                    Activated
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-3">
            <Field>
              <FieldLabel htmlFor="slotOwner">
                KYC Status
              </FieldLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noValidID">
                    No Valid ID
                  </SelectItem>
                  <SelectItem value="verified">
                    Verified
                  </SelectItem>
                  <SelectItem value="rejected">
                    Rejected
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="storeName">
                Store Name
              </FieldLabel>
              <Input
                id="storeName"
                placeholder="Enter Store Name"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="text-center py-5">
        <DialogTitle>Member Information</DialogTitle>
      </div>
      <FieldGroup>
        <FieldSet>
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
              <FieldLabel htmlFor="middleName">
                Middle Name
              </FieldLabel>
              <Input
                id="middleName"
                placeholder="Enter Middle Name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName">
                Last Name
              </FieldLabel>
              <Input
                id="lastName"
                placeholder="Enter Last Name"
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-3">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" placeholder="Enter Email" />
            </Field>
            <Field>
              <FieldLabel htmlFor="ContactNumber">
                Contact Number
              </FieldLabel>
              <Input
                id="ContactNumber"
                placeholder="Enter Contact Number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="countryCurrency">
                Country/Currency
              </FieldLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="philippines">
                    Philippines (PHP)
                  </SelectItem>
                  <SelectItem value="japan">
                    Japan (JPY)
                  </SelectItem>
                  <SelectItem value="usa">
                    USA (USD)
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="text-center py-5">
        <DialogTitle>Beneficiary Information</DialogTitle>
      </div>
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid grid-cols-3">
            <Field>
              <FieldLabel htmlFor="beneficiaryFirstName">
                Beneficiary First Name
              </FieldLabel>
              <Input
                id="beneficiaryFirstName"
                placeholder="Enter First Name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="beneficiaryMiddleName">
                Beneficiary Middle Name
              </FieldLabel>
              <Input
                id="beneficiaryMiddleName"
                placeholder="Enter Middle Name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="beneficiaryLastName">
                Beneficiary Last Name
              </FieldLabel>
              <Input
                id="beneficiaryLastName"
                placeholder="Enter Last Name"
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-3">
            <Field>
              <FieldLabel htmlFor="contactNumber">Contact Number</FieldLabel>
              <Input id="contactNumber" placeholder="Enter Contact Number" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
