//
//  MorphletSpringConfig.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSpringConfig.h"

@implementation MorphletSpringConfig

+ (instancetype)springWithMass:(CGFloat)mass stiffness:(CGFloat)stiffness damping:(CGFloat)damping {
  MorphletSpringConfig *spring = [MorphletSpringConfig new];
  spring->_mass = MAX(mass, 0.001);
  spring->_stiffness = MAX(stiffness, 0.001);
  spring->_damping = MAX(damping, 0);
  return spring;
}

- (instancetype)withoutBounce {
  CGFloat criticalDamping = 2 * sqrt(_stiffness * _mass);
  return [MorphletSpringConfig springWithMass:_mass stiffness:_stiffness damping:MAX(_damping, criticalDamping)];
}

+ (instancetype)springWithResponse:(CGFloat)response dampingFraction:(CGFloat)dampingFraction {
  CGFloat r = MAX(response, 0.01);
  return [self springWithMass:1 stiffness:pow(2 * M_PI / r, 2) damping:4 * M_PI * dampingFraction / r];
}

@end
