using System.Linq;
using AutoMapper;
using DatingApp.API.DTOs;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
             CreateMap<User, UserForListDto>()
            .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(
                src => src.Photos.FirstOrDefault(u => u.IsMain).Url))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(
                src => src.DateofBirth.CalcaulateAge()));
            CreateMap<User, UserForDetailDto>()
             .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(
                src => src.Photos.FirstOrDefault(u => u.IsMain).Url))
                 .ForMember(dest => dest.Age, opt => opt.MapFrom(
                src => src.DateofBirth.CalcaulateAge()));
            CreateMap<Photo, PhotoForDetailedDto>();
            CreateMap<UserForUpdateDto,User>();
            CreateMap<Photo,PhotoForReturnDto>();
            CreateMap<PhotoForCreationDto, Photo>();
        }
    }
}