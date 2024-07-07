export interface CreateDAODto{
    project_id: string
}

export interface AddMemberDto{
    project_id: string,
    pubkey: string,
    permissions: [string]
}

export interface RemoveMemberDto{
    project_id: string,
    pubkey: string
}

export interface WithdrawDto{
    project_id: string,
    is_execute: boolean,
    receiver: string,
    amount: Number
}

export interface ChangeThresholdDto{
    project_id: string,
    new_threshold: Number
}

export interface ExecuteProposalDto{
    project_id: string,
}

export interface VoteDto{
    project_id: string,
    voter: string,
    vote: string // approve cancel
}