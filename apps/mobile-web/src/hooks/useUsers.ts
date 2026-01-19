import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserController } from '../presentation/controllers/user-controller'
import { CreateUserRequest } from '../presentation/dto/user-dto'

const userController = new UserController()

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userController.getUserById(userId),
    enabled: !!userId,
  })
}

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (request: CreateUserRequest) => 
      userController.createUser(request),
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, request }: { userId: string, request: any }) => 
      userController.updateProfile(userId, request),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] })
    },
  })
}
